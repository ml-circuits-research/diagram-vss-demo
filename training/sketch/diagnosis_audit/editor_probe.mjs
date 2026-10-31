// editor_probe.mjs: two editor behaviours that decide what some gold labels execute (docs/js/logic.js)
import { K } from "./audit_lib.mjs";
const S = K.createSystem(), E = S.engine, W = S.world, edges = () => W.state.edges.map((e) => `${e.from}->${e.to}`).join(" ") || "(none)";
const mk = (names) => names.map((n, i) => ({ id: "c" + i, type: "command", args: { action: "create", name: n } }));
// (a) "connect A to B ... undo that" inside one message: the undo is one wire of the same run (one transaction per message)
E.run(mk(["A", "B", "C"]));                                         // turn 1
E.run([{ id: "s1", type: "command", args: { action: "connect", from: "B", to: "C" } }]);   // turn 2
const r = E.run([{ id: "s1", type: "command", args: { action: "connect", from: "A", to: "B" } }, { id: "s2", type: "command", args: { action: "undo" } }]);
console.log(`(a) turn 3 = "connect A to B, then undo that": edges after = ${edges()}; shapes = ${W.state.shapes.map((s) => s.name).join(",")}; errors = ${r.errors.map((e) => e.error.message).join("; ") || "none"}`);
const S2 = K.createSystem(); S2.engine.run(mk(["A", "B"]));
const r2 = S2.engine.run([{ id: "s1", type: "command", args: { action: "connect", from: "A", to: "B" } }, { id: "s2", type: "command", args: { action: "undo" } }]);
console.log(`(a') same message as the first message after the canvas: edges = ${S2.world.state.edges.map((e) => e.from + "->" + e.to).join(" ") || "(none)"}; shapes = ${S2.world.state.shapes.map((s) => s.name).join(",") || "(none)"}; errors = ${r2.errors.map((e) => e.error.message).join("; ") || "none"}`);
// (b) chain in text order Fox,Corn,Hen when the canvas order is Fox,Hen,Corn
const S3 = K.createSystem(); S3.engine.run(mk(["Fox", "Hen", "Corn"]));
S3.engine.run([{ id: "s1", type: "command", args: { action: "connect", from: ["Fox", "Corn", "Hen"], pairing: "chain" } }]);
console.log(`(b) connect from=Fox,Corn,Hen pairing=chain on canvas Fox,Hen,Corn: edges = ${S3.world.state.edges.map((e) => e.from + "->" + e.to).join(" ")}`);
// (c) check with two targets
const S4 = K.createSystem(); S4.engine.run(mk(["Hall", "Room1", "Room2"]).map((n, i) => (n.args.size = ["small", "large", "tiny"][i], n)));
const r4 = S4.engine.run([{ id: "s1", type: "question", args: { ask: "check", target: ["Room1", "Room2"], comparison: "bigger", anchor: "Hall" } }]);
console.log(`(c) check Room1,Room2 bigger than Hall (Room1 large, Room2 tiny, Hall small): ${r4.steps[0].answer}`);
// (d) mention(quantifier=all,recency=newest) as a target
const S5 = K.createSystem(); S5.engine.run(mk(["Sensor", "Gateway", "Cloud"]));
S5.engine.run([{ id: "s1", type: "command", args: { action: "duplicate", target: "Sensor", count: 3 } }]);
const r5 = S5.engine.run([{ id: "m1", type: "mention", args: { quantifier: "all", recency: "newest" } }, { id: "s2", type: "command", args: { action: "arrange", target: ["Sensor", { ref: "m1" }], layout: "column" } }]);
console.log(`(d) arrange target=Sensor,mention(quantifier=all,recency=newest): arranged ${JSON.stringify(r5.steps[1].value)}`);
