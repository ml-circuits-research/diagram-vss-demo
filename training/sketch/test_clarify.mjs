// test_clarify.mjs: node tests of docs/js/clarify.js (CLARIFY_DESIGN.md: the reply about a request that was not executed, design B).
//   node training/sketch/test_clarify.mjs
// 1. commandText writes readings as explicit commands in the help's forms; a key left open is a placeholder;
// 2. reasonsOf / heldReply / replyText: the reasons in plain words (disagreement with both values, a context fill, a request held because
//    of another, only one reader, two actions), the clearer command or the alternatives, what "Do it anyway" would run;
// 3. nothingReadText: a message with no request while requests are held: no question is pretended, the held ones are named;
// 4. supersedes / updatePending: a later executed request with the same action on the same shapes replaces the held one; heldView: what
//    the chat shows of one held request and what its Do it anyway and Edit buttons do;
// 5. on every gold request of fresh2 and short3 (no fact, no rule, no "$new"): commandText gives a command without "undefined", "null" or
//    a placeholder, and the Rules reader (docs/js/logic.js) reads it back to the same canonical request at least FLOOR of the time (90.7%
//    when written; the rest are Rules limits on lists and plural descriptions, listed when it fails).
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import * as C from "../../docs/js/clarify.js";
import { canon, canonWant } from "../../docs/js/bench-canon.js";

const require = createRequire(import.meta.url);
const K = require("../../docs/js/logic.js");
let fails = 0, n = 0;
const check = (name, ok, detail = "") => { n++; if (!ok) { fails++; console.log(`FAIL ${name}${detail ? "\n     " + detail : ""}`); } else console.log(`ok   ${name}`); };
const eq = (name, got, want) => check(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const names = ["Start", "Process", "Check", "Done", "EdgeFw", "Syslog", "Ivy"];

// 1. commandText
const T = (r, o = {}) => C.commandText(r, Object.assign({ names }, o));
eq("1. create", T({ action: "create", shape: "hexagon", color: "gray", name: "switch", position: "between", anchor: "start,done" }), "Add a gray hexagon named Switch between Start and Done.");
eq("1. create several", T({ action: "create", shape: "star", size: "tiny", color: "white", count: "8", position: "top" }), "Add 8 tiny white stars at the top.");
eq("1. set colour", T({ action: "set", target: "ivy", color: "teal" }), "Make Ivy teal.");
eq("1. set shape and colour", T({ action: "set", target: "ivy", color: "navy", shape: "ellipse" }), "Make Ivy a navy ellipse.");
eq("1. set outline", T({ action: "set", target: "check", outline: "orange" }), "Give Check an orange outline.");
eq("1. set on a description", T({ action: "set", target: "mention(quantifier=all,shape=circle)", color: "red" }), "Make all the circles red.");
eq("1. connect, dashed", T({ action: "connect", from: "start", to: "done", style: "dashed" }), "Connect Start to Done with a dashed arrow.");
eq("1. connect, a line", T({ action: "connect", from: "start", to: "done", arrow: "none" }), "Connect Start to Done with a line.");
eq("1. connect, two-way", T({ action: "connect", from: "start", to: "done", arrow: "both" }), "Connect Start to Done with a two-way arrow.");
eq("1. connect with a label: two commands", T({ action: "connect", from: "edgefw", to: "syslog", style: "dotted", label: "logs" }), 'Connect EdgeFw to Syslog with a dotted arrow. Label the arrow from EdgeFw to Syslog "logs".');
eq("1. chain", T({ action: "connect", from: "start,process,check" }), "Connect Start, Process and Check in a chain.");
eq("1. move relative", T({ action: "move", target: "done", position: "below", anchor: "check" }), "Move Done below Check.");
eq("1. move to a corner", T({ action: "move", target: "start", position: "topright" }), "Move Start to the top right corner.");
eq("1. undo twice", T({ action: "undo", count: "2" }), "Undo twice.");
eq("1. delete a description", T({ action: "delete", target: "mention(quantifier=all,shape=square,size=small)" }), "Delete all the small squares.");
eq("1. label an arrow", T({ action: "label", from: "check", to: "done", label: "yes" }), 'Label the arrow from Check to Done "yes".');
eq("1. remove all connections", T({ action: "disconnect", quantifier: "all" }), "Remove all connections.");
eq("1. remove a label", T({ action: "label", target: "done", label: "" }), "Remove the label of Done.");
eq("1. arrange everything", T({ action: "arrange", target: "mention(quantifier=all)", layout: "circle" }), "Arrange everything in a circle.");
eq("1. question: property", T({ ask: "property", target: "process", property: "outline" }), "What colour is the outline of Process?");
eq("1. question: degree", T({ ask: "degree", target: "done" }), "How many connections does Done have?");
eq("1. question: count arrows", T({ ask: "count", kind: "edge" }), "How many arrows are there?");
eq("1. $new: the name made earlier", T({ action: "connect", from: "check", to: "$new" }, { created: ["Fail"] }), "Connect Check to Fail.");
eq("1. a fact has no command", T({ target: "mars", color: "red" }), null);
eq("1. open key: placeholder", T({ action: "set", target: "ivy", color: "navy" }, { open: ["color"] }), "Make Ivy ‹which colour?›.");
eq("1. open anchor", T({ action: "move", target: "done", position: "below", anchor: "check" }, { open: ["anchor"] }), "Move Done below ‹which shape?›.");

// 2. reasons, heldReply, replyText
const disagree = { src: "Ivy can be a dark navy", type: "command", reading: { action: "set", target: "ivy", color: "navy" }, other: { action: "set", target: "ivy", color: "teal" },
  differ: [{ key: "color", sop: "navy", vss: "teal" }], signals: [] };
const r1 = C.heldReply(disagree, { names });
eq("2. disagreement: both values in the reason", r1.reasons[0], "the two readers read the colour (navy or teal) differently");
eq("2. disagreement: the clearer command has the colour open, with the two values read", r1.clearer, "Make Ivy ‹navy or teal?›.");
eq("2. disagreement: Do it anyway runs the executing reader's reading", r1.anyway, "Make Ivy navy.");
const fill = { src: "put Done below it", type: "command", reading: { action: "move", target: "done", position: "below", anchor: "check" }, other: { action: "move", target: "done", position: "below", anchor: "check" },
  differ: [], signals: [{ group: "context", word: "it", filled: "Check", key: "anchor" }] };
const r2 = C.heldReply(fill, { names });
eq("2. context fill: the reason names the word and the shape taken", r2.reasons[0], "“it” was taken to mean Check; the name was not written");
eq("2. context fill: the clearer command writes the name", r2.clearer, "Move Done below Check.");
check("2. context fill: the anchor is a placeholder key (it must be stated)", r2.placeholders.includes("anchor"), JSON.stringify(r2.placeholders));
const dep = { src: "connect Check to Fail", type: "command", reading: { action: "connect", from: "check", to: "fail" }, other: { action: "connect", from: "check", to: "fail" }, differ: [], signals: [],
  dependsOn: ["add Fail below Check in red"] };
const r3 = C.heldReply(dep, { names });
eq("2. depends on a held request: the reason says so", r3.reasons[0], "it needs “add Fail below Check in red” first, and that was not done");
eq("2. depends on a held request: no Do it anyway", r3.anyway, null);
check("2. depends on a held request: the reply says to do the other first, and does not offer Do it anyway",
  C.replyText("", [dep], { names }).some((l) => l.startsWith("  Do the request it depends on first")) && !C.replyText("", [dep], { names }).some((l) => /Do it anyway/.test(l)), C.replyText("", [dep], { names }).join("\n"));
const oneSide = C.heldReply({ src: "add Fail below Check", type: "command", reading: { action: "create", name: "fail", position: "below", anchor: "check" }, other: { action: "create", position: "above", anchor: "check" },
  differ: [{ key: "name", sop: "fail", vss: "∅" }, { key: "position", sop: "below", vss: "above" }], signals: [] }, { names });
eq("2. a value only one reader read: the generic placeholder; both read one: the two values", oneSide.clearer, "Add a shape named ‹which name?› ‹below or above?› Check.");
const two = { src: "Coach2 to Seniors", type: "command", reading: { action: "connect", from: "coach2", to: "seniors" }, other: { action: "rename", target: "coach2", name: "seniors" },
  otherAct: "rename", differ: [], signals: [] };
const r4 = C.heldReply(two, { names: ["Coach2"] });
eq("2. two actions: the reason", r4.reasons[0], "the words could mean two different things: connect or rename");
eq("2. two actions: one explicit command per reading", JSON.stringify(r4.alternatives), JSON.stringify(["Connect Coach2 to Seniors.", "Rename Coach2 to Seniors."]));
const alone = { src: "the red one", type: "command", reading: { action: "move" }, other: null, differ: [], signals: [] };
eq("2. only one reader", C.heldReply(alone, { names }).reasons[0], "only one of the two readers found a request here");
const agree = { src: "Process next to Done", type: "command", reading: { action: "move", target: "process", position: "near", anchor: "done" }, other: { action: "move", target: "process", position: "near", anchor: "done" }, differ: [], signals: [] };
eq("2. agreement below the threshold: the honest reason", C.heldReply(agree, { names }).reasons[0], "the reading is right most of the time, but not often enough to act without asking");
const lines = C.replyText("Check is now red.", [fill, disagree], { names });
eq("2. replyText: what was done first", lines[0], "Check is now red.");
eq("2. replyText: the line above the requests not done (no count: no numbers in the chat)", lines[1], "Not done, because I am not sure what you meant:");
check("2. replyText: each held request quoted, its reasons and its clearer command", lines.includes("• “put Done below it”") && lines.some((l) => l.includes("Write it with the colour stated") && l.includes("“Make Ivy ‹navy or teal?›.”")), lines.join("\n"));
check("2. replyText: Do it anyway is spelled out when the clearer command has an open value", lines.includes("  Do it anyway would run: “Make Ivy navy.”"), lines.join("\n"));
check("2. at most MAX_REASONS reasons", C.reasonsOf(Object.assign({}, disagree, { other: null, otherAct: "move", dependsOn: ["x"], signals: [{ group: "cut", text: "the cut was uncertain" }] })).length === C.MAX_REASONS);

// 3. nothing read
const t3 = C.nothingReadText([fill], { names });
check("3. no request read, requests held: says no question was asked and names the way forward", /did not ask a question/.test(t3) && /Do it anyway/.test(t3) && /Move Done below Check/.test(t3), t3);
eq("3. nothing held: no special text", C.nothingReadText([], {}), null);

// 4. superseding
check("4. same action on the same shape supersedes", C.supersedes({ action: "move", target: "done", position: "below", anchor: "check" }, fill.reading));
check("4. another action does not", !C.supersedes({ action: "set", target: "done", color: "red" }, fill.reading));
check("4. the same action on other shapes does not", !C.supersedes({ action: "move", target: "start", position: "top" }, fill.reading));
check("4. undo supersedes a held undo", C.supersedes({ action: "undo" }, { action: "undo", count: "2" }));
check("4. the same action sharing only the anchor does not", !C.supersedes({ action: "move", target: "start", position: "leftof", anchor: "check" }, fill.reading));
check("4. a connect with one end in common does not", !C.supersedes({ action: "connect", from: "start", to: "check" }, { action: "connect", from: "start", to: "done" }));
check("4. a create of the same name supersedes", C.supersedes({ action: "create", name: "fail", shape: "diamond" }, { action: "create", name: "fail", position: "below", anchor: "check" }));
check("4. two creates without a name do not", !C.supersedes({ action: "create", shape: "circle" }, { action: "create", shape: "square" }));
check("4. the same description supersedes", C.supersedes({ action: "set", target: "mention(quantifier=all,shape=circle)", color: "blue" }, { action: "set", target: "mention(quantifier=all,shape=circle)", color: "red" }));
// heldView: what the chat shows and what the two buttons do
const v1 = C.heldView(disagree, { names });
check("4b. heldView: Edit puts the clearer command with its placeholder; Do it anyway runs the reading and is spelled out", v1.edit === "Make Ivy ‹navy or teal?›." && v1.anyway === "Make Ivy navy." && v1.runs === "Do it anyway would run: “Make Ivy navy.”" && v1.canAnyway, JSON.stringify(v1));
const v3 = C.heldView(dep, { names });
check("4b. heldView: a request that depends on a held one has no Do it anyway, and Edit has the command to write after", !v3.canAnyway && v3.edit === "Connect Check to Fail." && /^Do the request it depends on first/.test(v3.line), JSON.stringify(v3));
const v4 = C.heldView(two, { names: ["Coach2"] });
check("4b. heldView: two actions: Edit has the first alternative, the line both", v4.edit === "Connect Coach2 to Seniors." && /or “Rename Coach2 to Seniors\.”/.test(v4.line), JSON.stringify(v4));
check("4b. heldView: no number in what the chat shows (a digit inside a name such as Coach2 is a name)", ![v1, v3, v4, C.heldView(fill, { names })].some((v) => /\b\d/.test([v.src, ...v.reasons, v.line, v.runs].join(" "))));
const up = C.updatePending([{ turn: 1, index: 0, reading: fill.reading, state: "held" }, { turn: 1, index: 1, reading: disagree.reading, state: "done anyway" }], [{ action: "move", target: "done", position: "below", anchor: "check" }]);
eq("4. updatePending: the held one is superseded", up[0].state, "superseded");
eq("4. updatePending: a request done anyway stays as it is", up[1].state, "done anyway");

// 5. every gold request of fresh2 and short3
const FLOOR = 0.88;
const sys = K.createSystem();
const dirs = ["opus_a", "opus_b", "opus_c", "opus_d"].map((d) => new URL(`llm_bench/fresh2/${d}`, import.meta.url).pathname).concat([new URL("llm_bench/short3", import.meta.url).pathname]);
let total = 0, rendered = 0, clean = 0, back = 0; const misses = [];
for (const d of dirs) for (const f of readdirSync(d).filter((f) => /^(msg|batch)_.*\.jsonl$/.test(f))) for (const l of readFileSync(`${d}/${f}`, "utf8").split("\n").filter(Boolean)) {
  const r = JSON.parse(l);
  for (const w of r.wires || []) {
    if (w.pending || !w.args || !(w.args.action || w.args.ask) || JSON.stringify(w.args).includes("$new")) continue;
    total++;
    const want = canonWant(w.type, w.args), t = C.commandText(want, { names: [...(r.names || []), ...(w.args.name ? String(w.args.name).split(",") : [])] });
    if (!t) continue; rendered++;
    // a placeholder is right only where the gold itself lacks the value (a label request without its text: the user must write it)
    if (!/undefined|null/.test(t) && (!/‹/.test(t) || (want.action === "label" && !("label" in want)))) clean++;
    const nodes = sys.formalize(t, { names: r.names || [], last: [] }).nodes, mains = nodes.filter((x) => x.type !== "mention");
    const got = mains.length === 1 ? canon(mains[0], nodes) : null;
    if (got && Object.entries(want).every(([k, v]) => (got[k] ?? "∅") === v) && Object.keys(got).every((k) => k in want)) back++; else if (misses.length < 15) misses.push(`${t}  <-  ${JSON.stringify(want)}`);
  }
}
check(`5. every gold request (no fact, rule or $new) is written as a command (${rendered} of ${total})`, rendered === total);
check(`5. no "undefined", "null" or placeholder in them (${clean} of ${rendered})`, clean === rendered);
check(`5. the Rules read ${back} of ${rendered} back to the same request (${(100 * back / rendered).toFixed(1)}%, floor ${FLOOR * 100}%)`, back / rendered >= FLOOR, misses.join("\n     "));

console.log(fails ? `FAIL (${fails} of ${n})` : `PASS (${n} checks)`);
process.exit(fails ? 1 : 0);
