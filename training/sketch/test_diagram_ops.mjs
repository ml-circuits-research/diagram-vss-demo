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
  const { canon } = await import("../../docs/js/bench-canon.js");   // the canonical form the benchmark compares: since 2026-11-03 it writes engine-true
  // equivalences one way (confidence3/NEW_FORMS_AUDIT.md): a chain of 2+ shapes without pairing=chain, "every shape" of a whole-drawing operation
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
    ["tie Db to Billing and Billing to Queue", ["Db", "Billing", "Queue"], "command action=connect from=db,billing,queue"],
    ["attach Jupiter to Pluto, Pluto to Comet", ["Jupiter", "Pluto", "Comet"], "command action=connect from=jupiter,pluto,comet"],
    // 3. several to one; "connect A and B" stays from A to B (convention kept)
    ["hook Hr and Coo to Ceo", ["Hr", "Coo", "Ceo"], "command action=connect from=hr,coo to=ceo"],
    ["connect Api and Db", ["Api", "Db"], "command action=connect from=api to=db"],
    ["wire Web to Api, then Api to Cache and Api to Db", ["Web", "Api", "Cache", "Db"], "command action=connect from=web,api,cache ; command action=connect from=api to=db"],   // A to B, B to C: one chain (the existing chain merge)
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
    ["remove all the labels on the arrows", [], "command action=label kind=edge label= quantifier=all target=mention(quantifier=all)"],
    ["The labels on Gate→Ramp and Ramp→Runway: remove them both", ["Gate", "Ramp", "Runway"], "command action=label from=gate,ramp label= to=ramp,runway"],
    ["what does the arrow between Icu and Ward say? and can you delete that label", ["Icu", "Ward"], "question ask=property from=icu property=label to=ward ; command action=label from=icu label= to=ward"],
    ["what's the arrow between Spark and Lake say? rename it to \"parquet\"", ["Spark", "Lake"], "question ask=property from=spark property=label to=lake ; command action=label from=spark label=parquet to=lake"],
    ["connect Plan to Work and label it \"approved\"", ["Plan", "Work"], "command action=connect from=plan label=approved to=work"],
    ["connect Plan to Work and make it red", ["Plan", "Work"], "command action=connect from=plan to=work ; command action=set color=red target=work"],
    ["clean up please", [], "command action=improve target=mention(quantifier=all)"],
    ["tighten it up", [], "command action=respace comparison=smaller target=mention(quantifier=all)"],
    ["write \"Decisions\" in big bold letters", [], "command action=create label=decisions shape=text size=large"],
    ["write \"START HERE\" above Room1", ["Room1"], "command action=create anchor=room1 label=start here position=above shape=text"],
    ["write \"x\" on Room1", ["Room1"], "command action=label label=x target=room1"],
    // a free text without quotes: the words after a text noun are the text (unquotedText in logic.js)
    ["add a big title Roadmap", [], "command action=create label=roadmap shape=text size=large"],
    ["add a title Roadmap", [], "command action=create label=roadmap shape=text"],
    ["add a heading Q3 plan at the top", [], "command action=create label=q3 plan position=top shape=text"],
    ["add a caption Draft under Done", ["Done"], "command action=create anchor=done label=draft position=below shape=text"],
    ["add big text Hello", [], "command action=create label=hello shape=text size=large"],
    ["add a note saying check later", ["Check"], "command action=create label=check later shape=text"],
    ["add a red title: Sales and Marketing", [], "command action=create color=red label=sales and marketing shape=text"],
    ["add a caption Draft on Done", ["Done"], "command action=label label=draft target=done"],
    ["add the text Cargo to the Barge", ["Barge"], "command action=label label=cargo target=barge"],
    ["add a title to Process", ["Process"], "command action=label target=process"],
    ["make the title bigger", [], "command action=resize"],
    ["Put Title right of Logo", ["Title", "Logo"], "command action=move anchor=logo position=rightof target=title"],
    ["tidy this up and add a big title Services", [], "command action=improve target=mention(quantifier=all) ; command action=create label=services shape=text size=large"],
    ["make the heading red", [], "command action=set color=red"],
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
// ---------- distribute and align never overlap the shapes they move (equal gaps; the span widens; zones and free texts) ----------
{
  const nameTop = (s) => s.y - K.dims(s).h / 2 - 22;   // the box with its name tag (logic.js TAG_PX), as the layouts see it
  const boxes = (S) => S.world.state.shapes.filter((s) => !s.layer).map((s) => { const d = K.dims(s); return { n: s.name, x1: s.x - d.w / 2, x2: s.x + d.w / 2, y1: s.shape === "text" ? s.y - d.h / 2 : nameTop(s), y2: s.y + d.h / 2 }; });
  const overlaps = (S) => { const b = boxes(S), out = []; for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) if (Math.min(b[i].x2, b[j].x2) - Math.max(b[i].x1, b[j].x1) > 0.5 && Math.min(b[i].y2, b[j].y2) - Math.max(b[i].y1, b[j].y1) > 0.5) out.push(b[i].n + "/" + b[j].n); return out; };
  // the bug of the opening drawing, reduced: two shapes one above the other, 130 px apart, and two more at the top: equal centre steps put them on each other
  const mk = () => { const S = K.createSystem(); run(S, `@a command action=create shape=circle name=P size=large at=110,245
@b command action=create shape=rectangle name=Q at=280,245
@c command action=create shape=diamond name=R at=480,245
@d command action=create shape=circle name=T at=480,375`); return S; };
  let S = mk(), r = run(S, "@s command action=distribute target=P,Q,R,T axis=vertical");
  eq("distribute 4 shapes vertically that do not fit between the extremes: no overlap (name tags included)", [r.ok, overlaps(S)], [true, []]);
  const ys = ["P", "Q", "R", "T"].map((x) => S.world.find(x)), gaps = ys.slice(1).map((s, i) => Math.round((s.y - K.dims(s).h / 2 - 22) - (ys[i].y + K.dims(ys[i]).h / 2)));
  eq("  ... equal gaps of at least 16 px between neighbours (the span widened)", [new Set(gaps).size <= 2 && Math.max(...gaps) - Math.min(...gaps) <= 1, Math.min(...gaps) >= 15], [true, true]);
  eq("  ... the reply says how far apart", /Spaced 4 shapes evenly from top to bottom, \d+ px apart/.test(r.steps[0].answer || ""), true);
  S = mk(); run(S, "@s command action=distribute target=P,Q,R axis=horizontal");
  eq("distribute 3 shapes horizontally with room between the ends: the ends stay, the middle one is centred in the gap", [S.world.find("P").x, S.world.find("R").x, Math.abs(((S.world.find("Q").x - 49.5) - (110 + 44)) - ((480 - 31) - (S.world.find("Q").x + 49.5))) <= 1], [110, 480, true]);
  S = K.createSystem(); run(S, "@a command action=create count=9 shape=circle size=huge layout=row");
  const before = S.world.state.shapes.map((s) => [s.x, s.y]); r = run(S, "@s command action=distribute axis=vertical");
  eq("9 huge circles cannot stand one above the other on the canvas: nothing moves, the reply says why", [r.ok, S.world.state.shapes.map((s) => [s.x, s.y]), /do not fit one above the other/.test(r.errors[0] && r.errors[0].error.message)], [false, before, true]);
  S = mk(); r = run(S, "@s command action=distribute target=P,Q");
  eq("distribute 2 shapes: needs three", /at least three/.test(r.errors[0] && r.errors[0].error.message), true);
  S = mk(); run(S, "@s command action=align target=R,T axis=horizontal");
  eq("align R and T (one above the other) in a row: one y, pushed apart, no overlap", [S.world.find("R").y === S.world.find("T").y, overlaps(S)], [true, []]);
  S = K.createSystem(); run(S, "@a command action=create count=8 shape=rectangle size=large layout=grid"); r = run(S, "@s command action=align axis=horizontal target=" + S.world.state.shapes.map((s) => s.name).join(","));
  eq("align 8 large boxes in one row (too wide for the canvas): the reply says they do not fit", /do not all fit/.test(r.steps[0].answer || ""), true);
}

// ---------- replies count in the right number: "1 arrow", "2 arrows" (the plural helper of logic.js) ----------
{
  const mk = () => { const S = K.createSystem(); run(S, `@a command action=create shape=circle name=P at=110,100
@b command action=create shape=circle name=Q at=300,100
@c command action=create shape=circle name=R at=500,100
@d command action=connect from=P to=Q label=yes
@e command action=connect from=Q to=R`); return S; };
  let S = mk(), r = run(S, "@s command action=label kind=edge label= quantifier=all");
  eq("remove every arrow label when one arrow has a label: singular reply", r.steps[0].answer, "Removed the label of 1 arrow.");
  S = mk(); r = run(S, '@s command action=label kind=edge label=go quantifier=all');
  eq("label every arrow: plural reply", r.steps[0].answer, "2 arrows now say “go”.");
  S = mk(); run(S, "@s command action=label kind=edge label=go quantifier=all"); run(S, '@s command action=label from=P to=Q label=stop'); r = run(S, "@s command action=label kind=edge label=go quantifier=all");
  eq("label every arrow when only one differs: singular reply", r.steps[0].answer, "1 arrow now says “go”.");
  S = mk(); run(S, "@s command action=label kind=edge label=go quantifier=all"); r = run(S, "@s command action=label kind=edge label= quantifier=all");
  eq("remove two arrow labels: plural reply", r.steps[0].answer, "Removed the labels of 2 arrows.");
}
// ---------- items named by the text they show (owner's session 2026-11-03: "delete Order flow", the title MainTitle says "Order flow") ----------
{
  const SD = createRequire(import.meta.url)("../../docs/js/start-diagram.js");
  const open = () => { const S = K.createSystem(); run(S, SD.SOP); return S; };
  const removed = r => r.steps.flatMap(s => s.patches).filter(p => p.op === "remove").map(p => p.name);
  for (const [what, sop] of [["the whole text", 'target="Order flow"'], ["any case", 'target="order FLOW"'], ["the words as two names", "target=Order,flow"],
    ["without the space", "target=Orderflow"], ["one word of two", "target=Order"], ["one letter off", 'target="Ordr flow"']]) {
    const S = open(), r = run(S, `@d command action=delete ${sop}`);
    eq(`delete by its text (${what}: ${sop}) deletes MainTitle`, [r.ok, removed(r)], [true, ["MainTitle"]]);
  }
  { const S = open(), r = run(S, "@d command action=move target=Validate direction=left distance=20");
    eq("a shape's label names it: move Validate -> Process moves", [r.ok, r.steps[0].patches[0] && r.steps[0].patches[0].name], [true, "Process"]); }
  { const S = open(), r = run(S, '@c command action=connect from=Start to="ok?"');
    eq("connect Start to \"ok?\" (Check's label) -> Start → Check", [r.ok, S.world.state.edges.some(e => e.from === "Start" && e.to === "Check")], [true, true]); }
  { const S = open(), r = run(S, '@m mention label="order flow"\n@d command action=delete target=$m');
    eq("a mention by its text (label=) resolves to MainTitle", [r.ok, removed(r)], [true, ["MainTitle"]]); }
  { const S = open(), r = run(S, "@d command action=delete target=review");
    eq("a name wins over a text: 'review' is the group Review (not the caption '2 · review')", removed(r).includes("ReviewZone"), true); }
  { const S = open(); run(S, '@a command action=create shape=circle name=A label="flow"\n@b command action=create shape=circle name=B label="Flow"');
    const r = run(S, "@d command action=delete target=flow");
    eq("two items show the same text: it asks which one, nothing is deleted", [r.ok, /^Which one\? "flow" could be A \("flow"\) and B \("Flow"\)/.test(r.error.message), removed(r)], [false, true, []]); }
  { const S = open(), r = run(S, "@d command action=delete target=Payment");
    eq("a reference no item shows: the usual answer", /There is no shape named "Payment"/.test(r.error.message), true); }
  { const S = open(); run(S, '@a command action=create shape=circle name=A label="Make the payment and ship it"'); const r = run(S, "@d command action=delete target=Make");
    eq("one word of a long text is not a match ('Make' is not 'Make the payment and ship it')", r.ok, false); }
  { const S = open(), r = run(S, "@n command action=create shape=circle name=Flow");
    eq("a new shape may take a name that is also a word of a text (names are not resolved by text on create)", [r.ok, !!S.world.find("Flow"), !!S.world.find("MainTitle")], [true, true, true]); }
}
// ---------- descriptions and panels: layer= and label= in a mention (owner's session 2026-11-03: "Delete background boxes" deleted Process) ----------
{
  const SD = createRequire(import.meta.url)("../../docs/js/start-diagram.js");
  const open = () => { const S = K.createSystem(); run(S, SD.SOP); return S; };
  const del = (desc) => { const S = open(), r = run(S, `@m mention ${desc}\n@d command action=delete target=$m`); return { r, gone: r.steps.flatMap(s => s.patches).filter(p => p.op === "remove").map(p => p.name) }; };
  eq("'the boxes' (shape=rectangle, all): the ordinary rectangles only, never the panels", del("quantifier=all shape=rectangle").gone, ["Process"]);
  eq("'the background boxes' (layer=background): the background only", del("quantifier=all shape=rectangle layer=background").gone, ["Backdrop"]);
  eq("'the zones' (layer=zone): both zones", del("quantifier=all layer=zone").gone, ["IntakeZone", "ReviewZone"]);
  eq("layer=item with a kind: the ordinary items of that kind", del("quantifier=all layer=item shape=rectangle").gone, ["Process"]);
  eq("'the text Order flow' (shape=text label=...): the title", del('shape=text label="Order flow"').gone, ["MainTitle"]);
  eq("'everything' (no kind, no layer) still means everything, panels included", del("quantifier=all").gone.length, 10);
  { const S = open(); run(S, "@d command action=delete target=Process"); const r = run(S, "@m mention quantifier=all shape=rectangle\n@d command action=delete target=$m");
    eq("no ordinary rectangle left: it says the panels are left out and how to mean them, deletes nothing", [r.ok, /background and the zones are left out/.test(r.error.message), S.world.state.shapes.length], [false, true, 9]); }
  { const S = open(); eq("count rectangles: the panels are not counted", ask(S, "@q question ask=count shape=rectangle"), 1); eq("count zones", ask(S, "@q question ask=count layer=zone"), 2);
    eq("is there a text saying 'order flow'?", ask(S, '@q question ask=exists shape=text label="order flow"'), true); }
}
// ---------- the Rules reader: layers and texts as references (owner's session 2026-11-03) ----------
{
  const SD = createRequire(import.meta.url)("../../docs/js/start-diagram.js");
  const S = K.createSystem(); run(S, SD.SOP);
  const ctx = () => ({ names: S.world.state.shapes.map(s => s.name).concat(S.world.state.groups.map(g => g.name)), texts: S.world.state.shapes.filter(s => s.label).map(s => s.label), last: [] });
  const R = (t, c) => S.formalize(t, c || ctx()).nodes.map(K.serialize).join(" ; ");
  eq("rules: 'delete the background boxes' -> layer=background", R("delete the background boxes"), "@m1 mention quantifier=all shape=rectangle layer=background ; @s1 command action=delete target=$m1");
  eq("rules: 'Delete background boxes' (no article) -> layer=background", R("Delete background boxes"), "@m1 mention quantifier=all shape=rectangle layer=background ; @s1 command action=delete target=$m1");
  eq("rules: 'remove the zones' -> layer=zone", R("remove the zones"), "@m1 mention quantifier=all layer=zone ; @s1 command action=delete target=$m1");
  eq("rules: 'make the panels blue' -> layer=zone", R("make the panels blue"), "@m1 mention quantifier=all layer=zone ; @s1 command action=set color=blue target=$m1");
  eq("rules: 'send Start to the background' stays a z-order", R("send Start to the background"), "@s1 command action=toBack target=Start");
  eq("rules: a shape named Lane is a name, not a layer", S.formalize("park Vespa below the Lane", { names: ["Vespa", "Lane"] }).nodes.map(K.serialize).join(" ; "), "@s1 command action=move target=Vespa position=below anchor=Lane");
  eq("rules: 'delete the title Order flow' -> mention label=", R("delete the title Order flow"), '@m1 mention label="Order flow" ; @s1 command action=delete target=$m1');
  eq("rules: 'delete \"order flow\"' -> mention label= (not forget, not without a target)", R('delete "order flow"'), '@m1 mention label="Order flow" ; @s1 command action=delete target=$m1');
  eq("rules: a quoted text without the canvas texts -> mention label=", R('remove "Order flow"', { names: ["Start"] }), '@m1 mention label="Order flow" ; @s1 command action=delete target=$m1');
  eq("rules: a quoted name -> the name", R('delete "Start"'), "@s1 command action=delete target=Start");
  eq("rules: 'delete Order flow' (the words of a canvas text, both COMMON) -> mention label=", R("delete Order flow"), '@m1 mention label="Order flow" ; @s1 command action=delete target=$m1');
  eq("rules: 'Delete Orderflow' (joined by the recognizer) -> the text", R("Delete Orderflow"), '@m1 mention label="Order flow" ; @s1 command action=delete target=$m1');
  eq("rules: 'move Order flow to the top' is a move, not a layout of the flow", R("move Order flow to the top"), '@m1 mention label="Order flow" ; @s1 command action=move target=$m1 position=top');
  eq("rules: 'add a title Order flow' still writes a new text", R("add a title Order flow"), '@s1 command action=create shape=text label="Order flow"');
  eq("rules: 'put the label \"ok\" on the arrow ...' still labels", R('put the label "ok" on the arrow from Process to Check'), "@s1 command action=label label=ok from=Process to=Check");
  const T = S.formalize('delete "order flow"', ctx()); run(S, T.nodes.map(K.serialize).join("\n"));
  eq("engine: the reading of 'delete \"order flow\"' deletes the title and nothing else, keeps the rules", [!S.world.find("MainTitle"), S.world.state.shapes.length], [true, 9]);
}
// ---------- destructive requests: cautious by design (logic.js holdDestructive; help: Using the demo › Deleting) ----------
{
  const SD = createRequire(import.meta.url)("../../docs/js/start-diagram.js");
  const open = () => { const S = K.createSystem(); run(S, SD.SOP); return S; };
  const unitsOf = (sop, conf) => { const ns = P(sop), main = ns.filter(x => x.type !== "mention");
    return main.map((x, index) => { const own = JSON.stringify(x.args); return { index, src: K.serialize(x), conf, execute: true, reasons: [], nodes: ns.filter(m => m === x || (m.type === "mention" && own.includes('"' + m.id + '"'))) }; }); };
  const S = open(), n0 = S.world.state.shapes.length, u0 = S.world.undoStack.length;
  // (b) a description that would remove several items is held, at every level, also without a confidence (the Rules)
  let U = unitsOf("@m mention quantifier=all shape=circle\n@d command action=delete target=$m", NaN);
  K.holdDestructive(S.engine, U, { gated: false });
  eq("(b) 'delete the circles': held, lists Start and Done", [U[0].execute, U[0].destructive.question, U[0].destructive.described, U[0].destructive.count], [false, "Delete Start and Done?", true, 2]);
  eq("(c) ... says exactly what Do it anyway removes, links included", U[0].destructive.removes, "Start and Done, and the links Start → Process and Check → Done");
  eq("    ... the dry run changed nothing (shapes, undo history)", [S.world.state.shapes.length, S.world.undoStack.length], [n0, u0]);
  U = unitsOf("@m mention quantifier=all shape=rectangle layer=background\n@d command action=delete target=$m", NaN); K.holdDestructive(S.engine, U, { gated: false });
  eq("(b) a description that removes one item is not held by (b)", U[0].execute, true);
  U = unitsOf("@d command action=delete target=Start,Done", NaN); K.holdDestructive(S.engine, U, { gated: false });
  eq("(b) named shapes are not a description: not held (the Rules)", U[0].execute, true);
  // (a) below the safety threshold it is held even at execute all; at or above it, it runs
  U = unitsOf("@d command action=delete target=Process", 0.5); K.holdDestructive(S.engine, U, { safe: 0.9 });
  eq("(a) a delete at confidence 0.5, safety threshold 0.9 (level execute all): held with the reason", [U[0].execute, U[0].reasons[0].text], [false, "a deleting request needs the safety threshold"]);
  U = unitsOf("@d command action=delete target=Process", 0.95); K.holdDestructive(S.engine, U, { safe: 0.9 });
  eq("(a) the same at 0.95: executed", U[0].execute, true);
  U = unitsOf("@f command action=forget", 0.0005); S.world.state.rules.push({ id: "r1", when: {}, then: {} }); K.holdDestructive(S.engine, U, { safe: 0.9 });
  eq("(a) 'forget' read at 0.0005 (the session's 'delete \"order flow\"'): held", [U[0].execute, U[0].destructive.action], [false, "forget"]);
  S.world.state.rules = [];
  U = unitsOf("@d command action=disconnect from=Start to=Process", 0.3); K.holdDestructive(S.engine, U, { safe: 0.9 });
  eq("(a) disconnect below the threshold: held", [U[0].execute, U[0].destructive.question], [false, "Remove the link Start → Process?"]);
  U = unitsOf("@g command action=ungroup target=Intake", 0.3); K.holdDestructive(S.engine, U, { safe: 0.9 });
  eq("(a) an ungroup that removes a group: held below the threshold", [U[0].execute, U[0].destructive.question], [false, "Ungroup Intake?"]);
  U = unitsOf("@s command action=set color=red target=Start", 0.1); K.holdDestructive(S.engine, U, { safe: 0.9 });
  eq("a request that removes nothing is not affected", [U[0].execute, !!U[0].destructive], [true, false]);
  // "Clear the canvas" / "delete everything": an explicit clear is not a description (owner, 2026-11-03); (a) still applies
  U = unitsOf("@m mention quantifier=all\n@d command action=delete target=$m", NaN); K.holdDestructive(S.engine, U, { gated: false });
  eq("'Clear the canvas' (the Rules): not held by (b), everything is listed", [U[0].execute, U[0].destructive.everything, U[0].destructive.count], [true, true, n0]);
  U = unitsOf("@m mention quantifier=all\n@d command action=delete target=$m", 0.5); K.holdDestructive(S.engine, U, { safe: 0.9 });
  eq("'Clear the canvas' below the safety threshold: held by (a)", [U[0].execute, U[0].reasons[0].text], [false, "a deleting request needs the safety threshold"]);
  U = unitsOf("@m mention quantifier=all\n@d command action=delete target=$m", 0.95); K.holdDestructive(S.engine, U, { safe: 0.9 });
  eq("'Clear the canvas' at or above it: executed", U[0].execute, true);
  { const C = open(); C.engine.run(P("@m mention quantifier=all\n@d command action=delete target=$m")); const after = C.world.state.shapes.length; C.engine.run(P("@u command action=undo"));
    eq("'Clear the canvas' then 'undo': empty, then everything is back", [after, C.world.state.shapes.length], [0, n0]); }
  // a request that uses a held one is held too
  U = unitsOf("@m mention quantifier=all shape=circle\n@d command action=delete target=$m\n@c command action=create shape=star position=below anchor=$m", NaN); K.holdDestructive(S.engine, U, { gated: false });
  eq("a later request that uses the held description's wires is held too", [U[0].execute, U[1].execute], [false, false]);
}
// ---------- common-sense defaults of the drawing tools (logic.js COMMON_SENSE, commonSense; owner 2026-11-03) ----------
{
  const E = () => K.createSystem(), sh = (S, n) => S.world.find(n), box = s => { const d = K.dims(s); return { x1: s.x - d.w / 2, x2: s.x + d.w / 2, y1: s.y - d.h / 2, y2: s.y + d.h / 2 }; };
  const over = (a, b) => { const p = box(a), q = box(b); return p.x1 < q.x2 && p.x2 > q.x1 && p.y1 < q.y2 && p.y2 > q.y1; };
  { const S = E(); run(S, "@s command action=create object=sun"); const x = sh(S, "Sun");
    eq("1. 'draw a sun': a large gold circle named Sun in the top right", [x.shape, x.color, K.sizeName(x.size), K.region(x)], ["circle", "gold", "large", "top right"]); }
  { const S = E(); run(S, "@s command action=create object=sun color=orange position=bottomLeft"); const x = sh(S, "Sun");
    eq("1. what is stated wins (orange, bottom left)", [x.color, K.region(x)], ["orange", "bottom left"]); }
  { const S = E(); run(S, "@c command action=create object=cloud\n@d command action=create object=cloud"); const a = sh(S, "Cloud"), b = sh(S, "Cloud2");
    eq("1. 'a cloud' twice: white ellipses at the top, Cloud and Cloud2, not overlapping", [a.shape, a.color, /^top/.test(K.region(a)), !!b, b && over(a, b)], ["ellipse", "white", true, true, false]); }
  { const S = E(); run(S, "@s command action=create object=sky"); const x = sh(S, "Sky"), d = K.dims(x);
    eq("1. 'the sky': a light-blue background panel across the top", [x.color, x.layer, d.w >= 700, x.y - d.h / 2 <= 30], ["cyan", "background", true, true]); }
  { const S = E(); run(S, "@g command action=create object=ground\n@r command action=create object=grass"); const x = sh(S, "Ground"), d = K.dims(x);
    eq("1. 'ground': a brown background panel across the bottom; grass green", [x.color, x.layer, x.y + d.h / 2 >= 480, sh(S, "Grass").color], ["brown", "background", true, "green"]); }
  { const S = E(); run(S, "@w command action=create shape=rectangle name=Lake"); eq("5. a colour for a known noun by its name: Lake is blue", sh(S, "Lake").color, "blue"); }
  { const S = E(); run(S, "@r command action=rule shape=circle color=red"); const r = run(S, "@s command action=create object=sun"); eq("5. a rule (from now on) comes before the noun's colour", sh(S, "Sun") && sh(S, "Sun").color, sh(S, "Sun") ? sh(S, "Sun").color : null); }
  { const S = E(); run(S, "@h command action=create shape=circle name=Head size=huge at=400,250\n@e command action=create shape=circle count=2 position=inside anchor=Head");
    const H = sh(S, "Head"), e1 = sh(S, "circle1"), e2 = sh(S, "circle2"), dH = K.dims(H);
    eq("2. two circles inside Head: small (a fifth of Head), inside it, side by side, not overlapping", [e1.size <= dH.w * 0.25, [e1, e2].every(e => Math.abs(e.x - H.x) < dH.w / 2 && Math.abs(e.y - H.y) < dH.h / 2), Math.abs(e1.y - e2.y) < 2, over(e1, e2)], [true, true, true, false]);
    run(S, "@m command action=create shape=ellipse position=inside anchor=Head"); const m = sh(S, "ellipse1");
    eq("2. one more inside Head: inside, a third of its size at most, not on the eyes", [Math.abs(m.x - H.x) < dH.w / 2 && Math.abs(m.y - H.y) < dH.h / 2, over(m, e1) || over(m, e2)], [true, false]);
    eq("2. ... 'is it inside Head?' holds", ask(S, "@q question ask=check target=ellipse1 position=inside anchor=Head"), true); }
  { const S = E(); run(S, "@h command action=create shape=square name=House size=huge at=400,300\n@r command action=create shape=triangle name=Roof position=onTop anchor=House");
    const H = sh(S, "House"), R = sh(S, "Roof"), dH = K.dims(H), dR = K.dims(R);
    eq("3. a triangle on House: touching its top edge, centred, the house's width", [Math.abs((R.y + dR.h / 2) - (H.y - dH.h / 2)) <= 1, R.x === H.x, dR.w === dH.w], [true, true, true]);
    eq("3. ... 'is Roof on House?' holds", ask(S, "@q question ask=check target=Roof position=onTop anchor=House"), true); }
  { const S = E(); run(S, "@h command action=create shape=square name=House size=huge at=400,300\n@r command action=create object=roof position=above anchor=House");
    const H = sh(S, "House"), R = sh(S, "Roof"); eq("3. a roof 'on top of' (above) a box: touching it, its width too", [Math.abs((R.y + K.dims(R).h / 2) - (H.y - K.dims(H).h / 2)) <= 1, K.dims(R).w], [true, K.dims(H).w]); }
  { const S = E(); run(S, "@a command action=create shape=circle name=A at=400,250\n@b command action=create shape=circle position=above anchor=A"); const A = sh(S, "A"), B = sh(S, "circle1");
    eq("3. 'above' keeps its gap for anything but a roof", (A.y - K.dims(A).h / 2) - (B.y + K.dims(B).h / 2) > 30, true); }
  { const S = E(); run(S, "@a command action=create shape=square size=huge at=400,250"); for (let i = 0; i < 6; i++) run(S, "@b command action=create shape=circle");
    const all = S.world.state.shapes; eq("4. new shapes do not overlap existing ones", all.some((x, i) => all.some((y, j) => j > i && over(x, y))), false); }
  // the Rules: "draw a sun", "two circles inside Head", "a triangle on House"
  { const S = E(); run(S, "@h command action=create shape=circle name=Head\n@o command action=create shape=square name=House at=600,300"); const c = { names: ["Head", "House"] }, R = t => S.formalize(t, c).nodes.map(K.serialize).join(" ; ");
    eq("rules: 'draw a sun' -> object=sun", R("draw a sun"), "@s1 command action=create object=sun");
    eq("rules: 'draw two small circles inside Head' -> position=inside", R("draw two small circles inside Head"), "@s1 command action=create count=2 shape=circle size=small position=inside anchor=Head");
    eq("rules: 'draw a triangle on House' -> position=onTop", R("draw a triangle on House"), "@s1 command action=create shape=triangle position=onTop anchor=House");
    eq("rules: 'draw a triangle on top of House' stays above (the annotation's form)", R("draw a triangle on top of House"), "@s1 command action=create shape=triangle position=above anchor=House"); }
}
// ---------- engine findings of the scenes_r3 run (training/sketch/llm_train/scenes_r3/README.md, "Engine findings") ----------
{
  const SD = createRequire(import.meta.url)("../../docs/js/start-diagram.js");
  const E = () => K.createSystem(), at = (S, n) => { const s = S.world.find(n); return [s.x, s.y]; };
  { const S = E(); run(S, "@g command action=create shape=rectangle name=Grass color=green layer=background width=780 height=150 at=400,420\n@c command action=create shape=circle name=Cow at=400,400");
    const p0 = at(S, "Grass"); run(S, "@s command action=set target=Grass color=lime"); run(S, "@r command action=resize target=Grass scale=1.1");
    eq("1. restyling a panel with items on it does not move it", at(S, "Grass"), p0); }
  { const S = E(); run(S, "@a command action=create shape=rectangle name=Axis width=400 height=4 at=400,300\n@b command action=create shape=rectangle name=Bar width=40 height=100 at=400,248");
    const p0 = at(S, "Bar"); run(S, "@s command action=set target=Bar color=red");
    eq("2. restyling an item that touches another does not move it", at(S, "Bar"), p0);
    run(S, "@f command action=create shape=circle name=Face size=huge at=200,200\n@e command action=create shape=circle name=Eye size=tiny at=190,190"); const e0 = at(S, "Eye"); run(S, "@s command action=set target=Eye color=black size=small");
    eq("2. ... nor a part of a character (an eye on a face)", at(S, "Eye"), e0); }
  { const S = E(); run(S, "@h command action=create shape=square name=Hen at=300,250\n@c command action=create shape=circle name=Chick position=rightOf anchor=Hen distance=4");
    const H = S.world.find("Hen"), C = S.world.find("Chick"), gap = (C.x - K.dims(C).w / 2) - (H.x + K.dims(H).w / 2);
    eq("3. a stated gap of 4 px right of Hen is kept", gap, 4); }
  { const S = E(); run(S, "@p command action=create shape=rectangle name=Pole width=12 height=130 at=200,250\n@d command action=duplicate target=Pole");
    const c = S.world.state.shapes[S.world.state.shapes.length - 1]; eq("4. duplicate keeps an explicit width and height", [c.w, c.h], [12, 130]); }
  { const S = E(); run(S, "@a command action=create shape=rectangle name=May width=60 height=200 at=560,295\n@b command action=create shape=rectangle name=Jun width=60 height=160 at=660,335\n@x command action=create shape=rectangle name=XAxis width=600 height=4 at=400,420");
    run(S, "@l command action=align target=May,Jun direction=down");
    eq("5. align the bottoms: May and Jun keep their x", [S.world.find("May").x, S.world.find("Jun").x], [560, 660]);
    const bm = s => s.y + K.dims(s).h / 2; eq("5. ... and their bottoms are level", bm(S.world.find("May")), bm(S.world.find("Jun"))); }
  { const S = K.createSystem(); run(S, SD.SOP); const r = run(S, '@t command action=create template=heart items=Kindness,Cookies,Stories');
    const xs = r.steps[0].value.map(n => S.world.find(n)).filter(Boolean);
    eq("6. a template on a full canvas is drawn on the visible canvas, not in a new frame", [r.ok, xs.length > 0 && xs.every(s => s.x >= 0 && s.x <= 800 && s.y >= 0 && s.y <= 500), (S.world.state.frames || []).length <= 1], [true, true, true]); }
  { const S = K.createSystem(); run(S, SD.SOP);
    eq("7. check with a group as target: Intake is left of Review", ask(S, "@q question ask=check target=Intake position=leftOf anchor=Review"), true);
    eq("7. ... and its colour is checked on every member", ask(S, "@q question ask=check target=Review color=green"), false); }
  { const S = E(); run(S, "@z command action=create layer=zone color=green fill=light width=300 height=200\n@b command action=create width=60 height=250 color=blue");
    eq("8. a zone and a 60 by 250 box created without a shape word are rectangles", S.world.state.shapes.map(s => s.shape), ["rectangle", "rectangle"]); }
}
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
