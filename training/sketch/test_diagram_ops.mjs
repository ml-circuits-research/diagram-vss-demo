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
// ---------- 5. the label of an existing connection: action=label with from= / to= (engine and rules reader) ----------
{
  const flow = () => { const S = K.createSystem(); run(S, `@a command action=create shape=circle name=Start at=100,250
@b command action=create shape=rectangle name=Process at=300,250
@c command action=create shape=diamond name=Check at=500,250
@d command action=create shape=circle name=Done color=red at=700,250
@e command action=connect from=Start to=Process
@f command action=connect from=Process to=Check
@g command action=connect from=Check to=Done`); return S; };
  const edge = (S, f, t) => S.world.state.edges.find((e) => e.from === f && e.to === t);
  const lbl = (S, f, t) => (edge(S, f, t) || {}).label ?? null;
  const err = (S, sop) => { const r = run(S, sop); return r.errors.length ? r.errors[0].error.message : null; };
  // engine
  const S = flow();
  run(S, '@s command action=label from=Process to=Check label=SomeName');
  eq("label the arrow Process -> Check: set", lbl(S, "Process", "Check"), "SomeName");
  eq("  ... the shapes keep their labels", ["Process", "Check"].map((x) => S.world.find(x).label), [null, null]);
  run(S, '@s command action=label from=Check to=Process label="two words"');
  eq("ends given the other way round: the arrow between them is relabeled (replace)", lbl(S, "Process", "Check"), "two words");
  eq("what does the arrow from Process to Check say", ask(S, "@q question ask=property property=label from=Process to=Check"), ["two words"]);
  run(S, "@u command action=undo"); eq("undo: the previous label is back", lbl(S, "Process", "Check"), "SomeName");
  run(S, "@r command action=redo"); eq("redo", lbl(S, "Process", "Check"), "two words");
  run(S, '@s command action=label from=Process to=Check label=""'); eq('label="" removes the label', lbl(S, "Process", "Check"), null);
  eq("  ... and the question says so", run(S, "@q question ask=property property=label from=Process to=Check").steps[0].answer, "The arrow Process → Check has no label.");
  run(S, "@u command action=undo"); eq("undo the removal", lbl(S, "Process", "Check"), "two words");
  eq("no such arrow: says so, changes nothing", [/There is no arrow between Start and Done/.test(err(S, "@s command action=label from=Start to=Done label=x")), S.world.state.edges.map((e) => e.label)], [true, [null, "two words", null]]);
  eq("a shape that does not exist: says so", /no shape named "Nope"/.test(err(S, "@s command action=label from=Nope to=Done label=x")), true);
  eq("no label text: asks for it", /What should the arrow say/.test(err(S, "@s command action=label from=Start to=Process")), true);
  run(S, "@s command action=connect from=Process to=Done");
  eq("one end matching two arrows: asks which one, changes nothing", [/2 arrows from Process: Process → Check; Process → Done\. Which one\?/.test(err(S, "@s command action=label from=Process label=x")), lbl(S, "Process", "Done")], [true, null]);
  run(S, "@s command action=label from=Start label=go"); eq("one end matching one arrow: labeled", lbl(S, "Start", "Process"), "go");
  run(S, "@s command action=connect from=Check to=Process");
  const r2 = run(S, "@s command action=label from=Check to=Process label=back");
  eq("arrows both ways: from/to picks the direction, the answer names the other one", [lbl(S, "Check", "Process"), lbl(S, "Process", "Check"), /also an arrow Process → Check/.test(r2.steps[0].answer)], ["back", "two words", true]);
  eq("the drawing written back as SOP carries the label", K.worldSOP(S.world.state).split("\n").filter((l) => /from=\$Check to=\$Process/.test(l)), ["@e5 edge label=back from=$Check to=$Process style=solid arrow=forward"]);
  const M = flow(); run(M, "@m mention shape=circle color=red\n@s command action=label from=Check to=$m label=end");
  eq("an end given by a description (the red circle)", lbl(M, "Check", "Done"), "end");
  const L = flow(); run(L, '@s command action=label target=Process label=Great'); run(L, '@s command action=label target=Process label=""');
  eq('a shape: label="" removes its label too', L.world.find("Process").label, null);

  // rules reader: English -> SOP, then run
  const names = ["Start", "Process", "Check", "Done"], ctx = { names, last: [] };
  const R = [
    ["label the arrow between Process and Check as SomeName", '@s1 command action=label label=SomeName from=Process to=Check'],
    ['label the arrow from Process to Check "yes"', '@s1 command action=label label=yes from=Process to=Check'],
    ["label the line from Process to Check as needs review", '@s1 command action=label label="needs review" from=Process to=Check'],
    ["name the link Process–Check Valid", '@s1 command action=label label=Valid from=Process to=Check'],
    ["name the link Process-Check Valid", '@s1 command action=label label=Valid from=Process to=Check'],
    ['put the label "ok" on the arrow from Process to Check', '@s1 command action=label label=ok from=Process to=Check'],
    ['add the label "go" to the arrow from Start to Process', '@s1 command action=label label=go from=Start to=Process'],
    ['write "no" on the arrow from Check to Done', '@s1 command action=label label=no from=Check to=Done'],
    ['call the arrow from Start to Process "begin"', '@s1 command action=label label=begin from=Start to=Process'],
    ['change the label of the arrow from Process to Check to "valid"', '@s1 command action=label label=valid from=Process to=Check'],
    ['make the arrow from Process to Check say "yes"', '@s1 command action=label label=yes from=Process to=Check'],
    ['label the Process→Check arrow "x"', '@s1 command action=label label=x from=Process to=Check'],
    ['label the arrow from Process as "out"', '@s1 command action=label label=out from=Process'],
    ['label the arrow into Done "in"', '@s1 command action=label label=in to=Done'],
    ["remove the label of the arrow between Process and Check", '@s1 command action=label label="" from=Process to=Check'],
    ["unlabel the arrow from Start to Process", '@s1 command action=label label="" from=Start to=Process'],
    ["what does the arrow from Process to Check say?", "@s1 question ask=property property=label from=Process to=Check"],
    ["what is the label of the arrow between Process and Check?", "@s1 question ask=property property=label from=Process to=Check"],
    ["what does the link Process–Check say?", "@s1 question ask=property property=label from=Process to=Check"],
    // counter-examples: a new arrow with a label is still a connection; removing an arrow is still a disconnection
    ['draw an arrow from Start to Done labeled "skip"', '@s1 command action=connect label=skip from=Start to=Done'],
    ['add an arrow from Start to Done with the label "skip"', '@s1 command action=connect label=skip from=Start to=Done'],
    ['connect Start to Done with a red arrow labeled "skip"', '@s1 command action=connect color=red label=skip from=Start to=Done'],
    ["delete the arrow between Start and Process", "@s1 command action=disconnect from=Start to=Process"],
    // a shape's label: removing it is not deleting the shape
    ["remove the label of Done", '@s1 command action=label label="" target=Done'],
    ["delete Done's label", '@s1 command action=label label="" target=Done'],
    ["unlabel Done", '@s1 command action=label label="" target=Done']
  ];
  for (const [t, want] of R) eq(`rules reader: ${t.padEnd(56)}`, S.formalize(t, ctx).nodes.map(K.serialize).join(" ; "), want);
  const E = flow(), said = (t) => { const nodes = E.formalize(t, ctx).nodes; const r = E.engine.run(nodes); return r.steps[r.steps.length - 1]; };
  said("label the arrow between Process and Check as SomeName");
  eq("end to end: label the arrow between Process and Check as SomeName", lbl(E, "Process", "Check"), "SomeName");
  said('label the arrow from Process to Check "Other"'); eq("end to end: replace", lbl(E, "Process", "Check"), "Other");
  eq("end to end: what does the arrow from Process to Check say", said("what does the arrow from Process to Check say?").answer, "The arrow Process → Check says “Other”.");
  said("remove the label of the arrow between Process and Check"); eq("end to end: remove", lbl(E, "Process", "Check"), null);
  said("undo"); eq("end to end: undo the removal", lbl(E, "Process", "Check"), "Other");
  eq("end to end: label the arrow between Start and Done (none): says so", /There is no arrow between Start and Done/.test((said('label the arrow between Start and Done "x"').error || {}).message), true);
}

// ---------- 6. "the shape Process", "the box Process", "the circle named Process", "the node Process": the shape of that name ----------
{
  const S = base(); run(S, "@n command action=create shape=rectangle name=Process at=400,250");
  const ctx = { names: ["A", "B", "C", "Y", "Process"], last: [] };
  const R = [
    ['label the shape Process as "Great"', '@s1 command action=label label=Great target=Process'],
    ['label the box Process "Great"', '@s1 command action=label label=Great target=Process'],
    ['label the circle named A "go"', '@s1 command action=label label=go target=A'],
    ['label the node Process as Great', '@s1 command action=label label=Great target=Process'],
    ["move the box Process below A", "@s1 command action=move target=Process position=below anchor=A"],
    ["move the node B next to the shape Process", "@s1 command action=move target=B position=near anchor=Process"],
    ["make the circle named B red", "@s1 command action=set color=red target=B"],
    ["make the shape Process a circle", "@s1 command action=set shape=circle target=Process"],
    ["delete the shape Process", "@s1 command action=delete target=Process"],
    ["connect the node A to the box Process", "@s1 command action=connect from=A to=Process"],
    ["rename the shape Process to Step", "@s1 command action=rename name=Step target=Process"],
    ["draw a circle named Hub next to the box Process", "@s1 command action=create shape=circle name=Hub position=near anchor=Process"],
    ["where is the shape Process?", "@s1 question ask=property property=position target=Process"],
    ["what color is the circle called A?", "@s1 question ask=property property=color target=A"],
    ["is the box Process red?", "@s1 question ask=check color=red target=Process"],
    ["the shape Process is red", "@s1 fact color=red target=Process"],
    ["move the circle called Foo up", "@s1 command action=move target=Foo direction=up"],
    // counter-examples: no name after the noun, a new shape and its name, plural nouns
    ["make the shape a circle", "@m1 mention ; @s1 command action=set shape=circle target=$m1"],
    ["draw a shape", "@s1 command action=create"],
    ["draw a red circle named Hub", "@s1 command action=create shape=circle color=red name=Hub"],
    ["add a box called Store below the box Process", "@s1 command action=create shape=rectangle name=Store position=below anchor=Process"],
    ["make the shape bigger", "@m1 mention ; @s1 command action=resize scale=1.5 target=$m1"],
    ["make all shapes blue", "@m1 mention quantifier=all ; @s1 command action=set color=blue target=$m1"],
    ['label the shape "hi"', '@m1 mention ; @s1 command action=label label=hi target=$m1']
  ];
  for (const [t, want] of R) eq(`rules reader: ${t.padEnd(48)}`, S.formalize(t, ctx).nodes.map(K.serialize).join(" ; "), want);
  const nodes = S.formalize('label the shape Process as "Great"', ctx).nodes; run(S, nodes.map(K.serialize).join("\n"));
  eq('end to end: label the shape Process as "Great" (with several shapes on the canvas)', [S.world.find("Process").label, S.world.find("A").label], ["Great", null]);
  const before = S.world.state.shapes.length; run(S, S.formalize("draw a shape", ctx).nodes.map(K.serialize).join("\n"));
  eq("end to end: draw a shape still draws one", S.world.state.shapes.length, before + 1);
}
// ---------- 7. several new shapes in a layout: create count=n layout=row|column|grid|circle (one wire, one undo step) ----------
{
  const ctx = { names: ["Hub", "Process"], last: [] };
  const R = [
    ["add 3 triangles in a circle layout", "@s1 command action=create count=3 shape=triangle layout=circle"],
    ["draw four squares in a row", "@s1 command action=create count=4 shape=square layout=row"],
    ["add 5 red stars arranged in a grid", "@s1 command action=create count=5 shape=star color=red layout=grid"],
    ["add 6 dots as a ring", "@s1 command action=create count=6 shape=circle layout=circle"],
    ["add 3 hexagons side by side", "@s1 command action=create count=3 shape=hexagon layout=row"],
    ["add 4 diamonds stacked", "@s1 command action=create count=4 shape=diamond layout=column"],
    ["draw 3 circles in a line", "@s1 command action=create count=3 shape=circle layout=row"],
    ["add three small squares in a row below Process", "@s1 command action=create count=3 shape=square size=small position=below anchor=Process layout=row"],
    // counter-examples: one shape, a shape noun that is the shape, "around" stays a position, arranging existing shapes
    ["draw a circle", "@s1 command action=create shape=circle"],
    ["add 3 circles in a row", "@s1 command action=create count=3 shape=circle layout=row"],
    ["put 4 stars around Hub", "@s1 command action=create count=4 shape=star position=near anchor=Hub"],
    ["arrange everything in a circle", "@m1 mention quantifier=all ; @s1 command action=arrange target=$m1 layout=circle"]
  ];
  const S0 = K.createSystem();
  for (const [t, want] of R) eq(`rules reader: ${t.padEnd(48)}`, S0.formalize(t, ctx).nodes.map(K.serialize).join(" ; "), want);
  const lay = (sop) => { const S = K.createSystem(); run(S, "@h command action=create shape=circle name=Hub at=400,120\n@p command action=create shape=rectangle name=Process at=400,250"); run(S, sop); return S; };
  const made = (S) => S.world.state.shapes.filter((s) => !["Hub", "Process"].includes(s.name));
  let S = lay("@s command action=create count=4 shape=square layout=row");
  eq("row: 4 squares, one y, distinct x, no overlap", [made(S).length, new Set(made(S).map((s) => s.y)).size, new Set(made(S).map((s) => s.x)).size, made(S).every((s, i, a) => i === 0 || s.x - a[i - 1].x >= K.dims(s).w)], [4, 1, 4, true]);
  S = lay("@s command action=create count=4 shape=diamond layout=column");
  eq("column: one x, distinct y", [new Set(made(S).map((s) => s.x)).size, new Set(made(S).map((s) => s.y)).size], [1, 4]);
  S = lay("@s command action=create count=5 shape=star layout=grid");
  eq("grid of 5: 2 rows, 3 columns", [new Set(made(S).map((s) => s.y)).size, new Set(made(S).map((s) => s.x)).size], [2, 3]);
  S = lay("@s command action=create count=6 shape=triangle layout=circle");
  const ms = made(S), cx = ms.reduce((t, s) => t + s.x, 0) / 6, cy = ms.reduce((t, s) => t + s.y, 0) / 6, rs = ms.map((s) => Math.hypot(s.x - cx, s.y - cy));
  eq("circle of 6 triangles: all triangles, about the same distance from their centre", [ms.every((s) => s.shape === "triangle"), Math.max(...rs) - Math.min(...rs) < 12], [true, true]);
  S = lay("@s command action=create count=3 shape=square size=small layout=row position=below anchor=Process");
  eq("row below Process: all below it, one y", [made(S).every((s) => s.y > S.world.find("Process").y + 20), new Set(made(S).map((s) => s.y)).size], [true, 1]);
  run(S, "@u command action=undo"); eq("one undo removes the whole row", made(S).length, 0);
}
// ---------- the Rules readings fixed after the synthetic data's rejects (training/sketch/synth/rejects.jsonl, class R), one per cause ----------
{
  const { canon } = await import("../../docs/js/bench-canon.js");
  const S0 = K.createSystem();
  const read = (t, names) => { const f = S0.formalize(t, { names: names || [], last: [] }); return f.nodes.filter((x) => x.type !== "mention").map((x) => `${x.type} ${Object.entries(canon(x, f.nodes)).map(([k, v]) => `${k}=${v}`).join(" ")}`).join(" ; "); };
  const ALL = "target=mention(quantifier=all)";
  const R = [
    // 1. every shape as the object, anywhere in the clause; "all" before a noun quantifies the noun; no axis word -> no axis
    ["align all horizontally", [], `command action=align axis=horizontal ${ALL}`],
    ["arrange all in a circle", [], `command action=arrange layout=circle ${ALL}`],
    ["arrange them all in a row", [], `command action=arrange layout=row ${ALL}`],
    ["distribute everything evenly", [], `command action=distribute ${ALL}`],
    ["make the whole diagram blue", [], `command action=set color=blue ${ALL}`],
    ["line up all of them", [], `command action=align ${ALL}`],
    ["tidy up the diagram", [], `command action=improve ${ALL}`],   // tidy -> improve (the ops patch, HIGH_LEVEL_OPS.md)
    ["arrange the whole diagram in a grid", [], `command action=arrange layout=grid ${ALL}`],
    ["make all red", [], `command action=set color=red ${ALL}`],
    ["make all circles red", [], "command action=set color=red target=mention(quantifier=all,shape=circle)"],
    ["move Db to the center of the diagram", ["Db"], "command action=move position=center target=db"],
    ["forget all rules", [], "command action=forget"],
    ["remove all connections", [], "command action=disconnect quantifier=all"],
    ["make the circles red and arrange them all in a row", [], "command action=set color=red target=mention(quantifier=all,shape=circle) ; command action=arrange layout=row target=mention(quantifier=all,shape=circle)"],
    // 2. "A to B and B to C" with every connect verb
    ["tie Db to Billing and Billing to Queue", ["Db", "Billing", "Queue"], "command action=connect from=db,billing,queue pairing=chain"],
    ["attach Jupiter to Pluto, Pluto to Comet", ["Jupiter", "Pluto", "Comet"], "command action=connect from=jupiter,pluto,comet pairing=chain"],
    // 3. several to one; "connect A and B" stays from A to B (convention kept)
    ["hook Hr and Coo to Ceo", ["Hr", "Coo", "Ceo"], "command action=connect from=hr,coo to=ceo"],
    ["connect Api and Db", ["Api", "Db"], "command action=connect from=api to=db"],
    ["wire Web to Api, then Api to Cache and Api to Db", ["Web", "Api", "Cache", "Db"], "command action=connect from=web,api,cache pairing=chain ; command action=connect from=api to=db"],   // A to B, B to C: one chain (the existing chain merge)
    // 4. a valid word is not corrected into a cue
    ["what does the ellipse point to?", [], "question ask=neighbors target=mention(shape=ellipse)"],
    ["is Kafka part of any group?", ["Kafka"], "question ask=groupof target=kafka"],
    ["what's written on Crab?", ["Crab"], "question ask=property property=label target=crab"],
    ["draw a star labeled cold", [], "command action=create label=cold shape=star"],
    // 5. label it "x": the pronoun is the target
    ["make Salt smaller, and then label it \"end\"", ["Salt"], "command action=resize target=salt ; command action=label label=end target=salt"],
    // 6. put the label "x" on a description
    ["put the label \"retry\" on each indigo box", [], "command action=label label=retry target=mention(color=indigo,quantifier=all,shape=rectangle)"],
    ["add a title \"Q3\" at the top", [], "command action=create label=q3 position=top shape=text"],
    // 7. the edge of the canvas is not a connection
    ["how many boxes along the left edge?", [], "question ask=count position=left shape=rectangle"],
    // 8. a connection between two shapes
    ["is there a connection between Scene2 and Climax?", ["Scene2", "Climax"], "question anchor=scene2 ask=connected target=climax"],
    // 9. one-letter names in the clause splitters ("A" before a shape noun stays the article)
    ["hook C to X, then G to E", ["C", "X", "G", "E"], "command action=connect from=c to=x ; command action=connect from=g to=e"],
    ["Set K to orange, Z to pink.", ["K", "Z"], "command action=set color=orange target=k ; command action=set color=pink target=z"],
    ["Q right under B", ["Q", "B"], "command action=move anchor=b position=below target=q"],
    ["A circle near B", ["A", "B"], "command action=create anchor=b position=near shape=circle"],
    // 10. polite openers before verb ellipsis and several created objects; a list of names before one value stays one request
    ["can you make Lead normal and Manager big", ["Lead", "Manager"], "command action=set size=medium target=lead ; command action=set size=large target=manager"],
    ["now please create a black ellipse and a hexagon", [], "command action=create color=black shape=ellipse ; command action=create shape=hexagon"],
    ["paint Ab, Bc and Cd red", ["Ab", "Bc", "Cd"], "command action=set color=red target=ab,bc,cd"],
    ["change the shape of S3 and Bucket to a triangle", ["S3", "Bucket"], "command action=set shape=triangle target=s3,bucket"],
    // label removals and arrow labels are never shape deletions or renames (opus_ext_1 README: destructive readings)
    ["remove all the labels on the arrows", [], "command action=label kind=edge label= quantifier=all"],
    ["The labels on Gate→Ramp and Ramp→Runway: remove them both", ["Gate", "Ramp", "Runway"], "command action=label from=gate,ramp label= to=ramp,runway"],
    ["what does the arrow between Icu and Ward say? and can you delete that label", ["Icu", "Ward"], "question ask=property from=icu property=label to=ward ; command action=label from=icu label= to=ward"],
    ["what's the arrow between Spark and Lake say? rename it to \"parquet\"", ["Spark", "Lake"], "question ask=property from=spark property=label to=lake ; command action=label from=spark label=parquet to=lake"],
    ["connect Plan to Work and label it \"approved\"", ["Plan", "Work"], "command action=connect from=plan label=approved to=work"],
    ["connect Plan to Work and make it red", ["Plan", "Work"], "command action=connect from=plan to=work ; command action=set color=red target=work"],
    ["clean up please", [], "command action=improve"],
    ["tighten it up", [], "command action=respace comparison=smaller"],
    ["write \"Decisions\" in big bold letters", [], "command action=create label=decisions shape=text size=large"],
    ["write \"START HERE\" above Room1", ["Room1"], "command action=create anchor=room1 label=start here position=above shape=text"],
    ["write \"x\" on Room1", ["Room1"], "command action=label label=x target=room1"],
    ["clear arrow label check done", ["Start", "Check", "Done"], "command action=label from=check label= to=done"],
    ["sketch a sunrise of Autumn, Design and Support thanks", [], "command action=create items=autumn,design,support template=sunrise"],
    ["flip Cat and Dog", ["Cat", "Dog"], "command action=swap target=cat,dog"],
    ["reverse that", [], "command action=undo"],
    ["Decision tree for the hiring flow.", [], ""],
    ["which shapes can be reached from the rect?", [], "question ask=reachable from=mention(shape=rectangle)"],
    // 11. a typo in the capitalised first word; a title is not corrected
    ["Deelte Db", ["Db"], "command action=delete target=db"],
    ["Brong Hero in front", ["Hero"], "command action=tofront target=hero"],
    ["Spice rack. Make Salt white.", ["Salt"], "command action=set color=white target=salt"]
  ];
  const sortKeys = (s) => s.split(" ; ").map((w) => { const [t, ...kv] = w.split(" "); return [t, ...kv.sort()].join(" "); }).join(" ; ");
  for (const [t, names, want] of R) eq(`rules reader: ${t.padEnd(52)}`, sortKeys(read(t, names)), sortKeys(want));
  // the words the formalizer's own patterns read are never "corrected" (a word the Rules read is not a typo)
  const words = "point points part written read reads stays note notes zones tones clean cold".split(" ");
  eq("no pattern word or legend cue is corrected by the spelling step", words.filter((w) => S0.formalize(`${w}`, { names: [], last: [] }).corrections.length), []);
}
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
