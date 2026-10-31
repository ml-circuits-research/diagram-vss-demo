// test_editor_history.mjs: undo / redo inside a message, and the order of a chain connect (docs/js/logic.js). Run: node test_editor_history.mjs
import { createRequire } from "node:module";
const K = createRequire(import.meta.url)("../../docs/js/logic.js");
let fail = 0;
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fail++; console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : `\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`); };
const create = (id, name) => ({ id, type: "command", args: { action: "create", name, shape: "circle" } });
const act = (id, action, extra) => ({ id, type: "command", args: Object.assign({ action }, extra || {}) });
const names = (W) => W.state.shapes.map((s) => s.name).join(",") || "(none)";
const edges = (W) => W.state.edges.map((e) => `${e.from}>${e.to}`).join(" ") || "(none)";

{ // 1. create then undo in one message, as the first message on the canvas: the create is undone, nothing else happens
  const S = K.createSystem(); const r = S.engine.run([create("s1", "A"), act("s2", "undo")]);
  eq("create A + undo in one message (empty canvas): canvas empty, no error", [names(S.world), r.errors.length], ["(none)", 0]);
  eq("  ... and nothing is left to undo", S.world.undoStack.length, 0);
}
{ // 1b. the same on a canvas that already has shapes from an earlier turn: the earlier turn is kept
  const S = K.createSystem(); S.engine.run([create("s1", "A"), create("s2", "B")]);
  S.engine.run([create("s1", "C"), act("s2", "undo")]);
  eq("earlier turn A,B; message 'create C, undo': A,B stay", names(S.world), "A,B");
}
{ // 2. two messages, then undo: reverts the second message only; a second undo the first
  const S = K.createSystem(); S.engine.run([create("s1", "A"), create("s2", "B")]); S.engine.run([create("s1", "C")]);
  S.engine.run([act("s1", "undo")]); eq("two messages then undo: second message reverted", names(S.world), "A,B");
  S.engine.run([act("s1", "undo")]); eq("  ... undo again: first message reverted", names(S.world), "(none)");
  // undo after an action of the same message steps over that action, not the previous turn
  const T = K.createSystem(); T.engine.run([create("s1", "A"), create("s2", "B")]);
  T.engine.run([act("s1", "connect", { from: "A", to: "B" }), act("s2", "undo")]);
  eq("message 'connect A to B, undo': the connect is undone, the shapes stay", [names(T.world), edges(T.world)], ["A,B", "(none)"]);
  T.engine.run([create("s1", "C"), create("s2", "D"), act("s3", "undo", { count: 2 })]);
  eq("message 'create C, create D, undo twice': both undone, earlier turn kept", names(T.world), "A,B");
  T.engine.run([create("s1", "C"), act("s2", "undo"), act("s3", "undo")]);
  eq("message 'create C, undo, undo' (earlier turn made A,B): the second undo reaches that turn", names(T.world), "(none)");
}
{ // 3. undo then redo
  const S = K.createSystem(); S.engine.run([create("s1", "A")]); S.engine.run([create("s1", "B")]);
  S.engine.run([act("s1", "undo")]); S.engine.run([act("s1", "redo")]);
  eq("undo then redo in two messages", names(S.world), "A,B");
  const T = K.createSystem(); T.engine.run([create("s1", "A")]);
  T.engine.run([create("s1", "B"), act("s2", "undo"), act("s3", "redo")]);
  eq("message 'create B, undo, redo': B is back", names(T.world), "A,B");
  eq("  ... and it is one undoable turn", (T.engine.run([act("s1", "undo")]), names(T.world)), "A");
  const U = K.createSystem(); U.engine.run([create("s1", "A")]); U.engine.run([create("s1", "B")]);
  U.engine.run([act("s1", "undo"), act("s2", "redo")]);
  eq("message 'undo, redo' after a turn: net effect nothing", names(U.world), "A,B");
  const V = K.createSystem(); V.engine.run([create("s1", "A")]);
  V.engine.run([create("s1", "B"), act("s2", "undo")]); V.engine.run([act("s1", "redo")]);
  eq("redo in the next message does not bring back an action undone inside a finished message", names(V.world), "A");
}
{ // 4. chain connect keeps the order the text gives
  const S = K.createSystem(); S.engine.run([create("s1", "A"), create("s2", "B"), create("s3", "C")]);
  S.engine.run([act("s1", "connect", { from: ["C", "A", "B"], pairing: "chain" })]);
  eq("connect C, A, B in a chain (canvas order A,B,C)", edges(S.world), "C>A A>B");
  const T = K.createSystem(); T.engine.run([create("s1", "A"), create("s2", "B"), create("s3", "C")]);
  T.engine.run([act("s1", "connect", { from: ["B", "C"], to: ["A"], pairing: "chain" })]);
  eq("from B,C to A, chain", edges(T.world), "B>C C>A");
  const U = K.createSystem(); const f = U.formalize("Create a circle named A, a circle named B and a circle named C. Connect C, A and B in a chain.", { names: [], last: [] });
  U.engine.run(f.nodes);
  eq("same, from the text through the rules reader", edges(U.world), "C>A A>B");
}
console.log(fail ? `\n${fail} FAILED` : "\nall passed"); process.exit(fail ? 1 : 0);
