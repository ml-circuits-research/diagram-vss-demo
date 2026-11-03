// test_help_answers.mjs: the help world (design: training/sketch/legend_ext/LEGEND_EXT.md section 4).
//  1. docs/js/help-answers.js alone, on a small hand-made legend: answers are built from the legend (a value added to the legend shows up
//     in the answer without any other change; a plugin switched off is said), unknown topics get an honest answer.
//  2. On the live engine (docs/js/logic.js + help.js + templates.js): every topic of the legend (every action, question, key, value,
//     template, plugin) gets a non-empty answer in every aspect; every example an answer offers is read by the Rules reader into a wire
//     the engine runs without an error on the opening drawing (docs/js/start-diagram.js).
//  3. The Rules reader writes the help wire for the owner's questions, and leaves requests and drawing questions alone.
//  4. Every example sentence of the help pages runs on the opening drawing (after its `pre` sentences) without an engine error.
// Run: node training/sketch/test_help_answers.mjs   (exit code 1 on a failure)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const HA = require("../../docs/js/help-answers.js"), K = require("../../docs/js/logic.js"), HK = require("../../docs/js/help.js"), TK = require("../../docs/js/templates.js"), SD = require("../../docs/js/start-diagram.js");
let fail = 0, n = 0; const fails = [];
const ok = (name, cond, detail) => { n++; if (!cond) { fail++; fails.push(name + (detail ? `\n     ${detail}` : "")); } };

// ---------- 1. the generator alone ----------
{
  const legend = { action: { ask: "What should happen?", kind: "enum", values: { connect: ["link", "join"], paint: ["colour"] }, plugins: ["links", "looks"] },
    color: { ask: "What colour?", kind: "enum", values: { red: ["crimson"], blue: [] }, plugins: ["looks"] }, style: { ask: "Solid or dashed?", kind: "enum", values: { solid: [], dashed: ["dash"] }, plugins: ["links"] } };
  const plugins = [{ name: "links", title: "Links", description: "Arrows between shapes.", enabled: true, actions: ["connect"], asks: [], wireTypes: [], keys: ["style"] },
    { name: "looks", title: "Looks", description: "Colours.", enabled: true, actions: ["paint"], asks: [], wireTypes: [], keys: ["color"] }];
  const docs = { ACTIONS: { connect: { t: "Connect", d: "Draw an arrow between two shapes.", ex: ["Connect A to B"] } }, ASKS: {}, CAPS: {}, TOPICS: {} };
  const ctx = { legend, plugins, docs, templates: [] };
  const a1 = HA.answer({ topic: "color", aspect: "values" }, ctx);
  ok("values of a key: every value is named", ["red", "blue"].every(v => a1.text.includes(v)) && a1.text.includes("crimson"), a1.text);
  legend.color.values.mint = [];   // the legend changes: the answer follows, nothing else is edited
  ok("a value added to the legend appears in the answer", HA.answer({ topic: "color", aspect: "values" }, ctx).text.includes("mint"));
  const a2 = HA.answer({ topic: "connect", aspect: "how" }, ctx);
  ok("how: the help page's description, an example, the cue words and the details", /Draw an arrow/.test(a2.text) && /Connect A to B/.test(a2.text) && /link/.test(a2.text) && /style \(solid and dashed\)/.test(a2.text) && a2.examples[0] === "Connect A to B", a2.text);
  const a3 = HA.answer({ topic: "paint", aspect: "how" }, ctx);
  ok("an action without a help-page entry is still answered from the legend", a3.known && /paint/i.test(a3.text) && /colour/.test(a3.text), a3.text);
  plugins[0].enabled = false;
  ok("a plugin switched off is said in the answer", /switched off/.test(HA.answer({ topic: "connect", aspect: "can" }, ctx).text));
  plugins[0].enabled = true;
  const a4 = HA.answer({ about: "images", aspect: "can" }, ctx);
  ok("unknown: says it does not know, then what it can do", !a4.known && /don't know “images”/.test(a4.text) && /links/i.test(a4.text), a4.text);
  const a5 = HA.answer({ topic: "rocket" }, ctx);
  ok("an unknown topic is answered honestly", !a5.known && /rocket/.test(a5.text));
  ok("a cue word as topic finds its value (crimson -> red)", HA.sensesOf(ctx, "crimson").some(s => s.kind === "value"));
  ok("topicLegend: every action, key and value is a topic", ["connect", "paint", "color", "style", "red", "dashed", "links", "general"].every(t => t in HA.topicLegend(ctx).topic.values));
}

// ---------- the opening drawing, the Rules reader ----------
const fresh = () => { const S = K.createSystem(); const r = S.engine.run(K.parse(SD.SOP)); if (r.errors.length) throw new Error("start diagram: " + r.errors[0].error.message); S.world.undoStack = []; return S; };
const namesOf = S => S.world.state.shapes.map(s => s.name).concat((S.world.state.groups || []).map(g => g.name));
const read = (S, text) => S.formalize(text, { names: namesOf(S), last: [] });
const runText = (S, text) => { const f = read(S, text); if (!f.nodes.length) return { err: "no wire: " + f.notes.join(" ") }; const r = S.engine.run(f.nodes); const e = r.errors.find(x => !(x.error instanceof K.Clarify) && !/^There is nothing to (?:undo|redo)/.test(x.error.message)); return { f, r, err: e ? e.error.message : null }; };   // undo / redo on a fresh drawing have nothing to step over: not an error of the example

// ---------- 2. every topic, every aspect, on the live engine ----------
{
  const S = fresh(), ctx = HA.contextFromEngine(S.engine, { docs: HK, templates: TK.catalogue() }), topics = [...HA.topics(ctx).keys()];
  let answers = 0; const exSeen = new Set();
  for (const t of topics) for (const asp of HA.ASPECTS) {
    const r = HA.answer({ topic: t, aspect: asp }, ctx); answers++;
    if (!(r.known && r.text && r.text.length > 20)) ok(`topic ${t} aspect ${asp}: an answer`, false, r.text);
    r.examples.forEach(e => exSeen.add(e));
  }
  ok(`${topics.length} topics x ${HA.ASPECTS.length} aspects answered (${answers})`, answers === topics.length * HA.ASPECTS.length);
  for (const tpl of Object.keys(TK.TEMPLATES)) { const r = HA.answer({ topic: tpl, aspect: "how" }, ctx); ok(`template ${tpl}: parameters and example`, /items/.test(r.text) && r.examples.includes(TK.TEMPLATES[tpl].ex), r.text); }
  // the examples an answer offers: each one does what it says on the opening drawing
  let exOk = 0; const bad = [];
  for (const e of exSeen) { const x = runText(fresh(), e); if (x.err) bad.push(`${e} -> ${x.err}`); else exOk++; }
  ok(`every example offered by an answer runs on the opening drawing (${exOk}/${exSeen.size})`, !bad.length, bad.slice(0, 8).join("\n     "));
  // the engine's help wire: no change to the drawing, the examples on the step
  const before = JSON.stringify(S.world.state), r = S.engine.run(K.parse("@h question ask=help topic=connect aspect=how"));
  ok("ask=help changes nothing and returns the examples", JSON.stringify(S.world.state) === before && r.steps[0].examples.length > 0 && /Connect/.test(r.steps[0].answer));
  S.engine.plugin("connections").enabled = false;
  ok("with Arrows and lines switched off, the help answer says so", /switched off/.test(S.engine.run(K.parse("@h question ask=help topic=connect aspect=can")).steps[0].answer));
  S.engine.plugin("help").enabled = false;
  ok("with Help switched off, ask=help is refused like any switched-off capability", /switched off/.test((S.engine.run(K.parse("@h question ask=help")).errors[0] || { error: {} }).error.message || ""));
}

// ---------- 3. the Rules reader on help questions (the owner's six and their kin), and what must stay a request ----------
{
  const S = fresh(), w = t => read(S, t).nodes.map(K.serialize).join(" ; ");
  const HELP = [
    ["help", "@s1 question ask=help"],
    ["How do I connect two shapes?", "@s1 question ask=help topic=connect aspect=how"],
    ["What colours can I use?", "@s1 question ask=help topic=color aspect=values"],
    ["Can I group things?", "@s1 question ask=help topic=group aspect=can"],
    ["What can you do with arrows?", "@s1 question ask=help topic=connections aspect=overview"],
    ["How do I make a timeline?", "@s1 question ask=help topic=timeline aspect=how"],
    ["what kinds of shapes can I draw?", "@s1 question ask=help topic=shape aspect=values"],
    ["show me an example of a pyramid", "@s1 question ask=help topic=pyramid aspect=example"],
    ["can you draw stars?", "@s1 question ask=help topic=star aspect=can"],
    ["How do I write a title?", "@s1 question ask=help topic=text aspect=how"],
    ["can I add images?", "@s1 question ask=help aspect=can about=images"],
    ["What templates are there to choose?", "@s1 question ask=help topic=template aspect=values"]
  ];
  for (const [t, want] of HELP) ok(`Rules: "${t}"`, w(t) === want, `got  ${w(t)}\n     want ${want}`);
  const NOT = [["Can you draw a star?", "action=create"], ["can you undo", "action=undo"], ["could you connect Start to Done", "action=connect"], ["How many circles are there?", "ask=count"], ["Which shapes are green?", "ask=list"], ["can you get rid of the navy star", "action=delete"]];
  for (const [t, want] of NOT) ok(`Rules: "${t}" stays a request or a drawing question`, w(t).includes(want) && !w(t).includes("ask=help"), w(t));
  const both = read(S, "how do I make arrows dashed? anyway connect Start to Done").nodes.map(K.serialize);
  ok("a help question and a request in one message: two wires", both.length === 2 && /ask=help/.test(both[0]) && /action=connect/.test(both[1]), both.join(" ; "));
}

// ---------- 4. the help pages' example sentences on the opening drawing ----------
{
  const bad = []; let good = 0;
  for (const e of HK.examples()) {
    const S = fresh(); let err = null;
    for (const p of e.pre) { const x = runText(S, p); if (x.err) { err = `pre "${p}": ${x.err}`; break; } }
    if (!err) { const x = runText(S, e.text); err = x.err; }
    if (err) bad.push(`${e.text} -> ${err}`); else good++;
  }
  ok(`help-page examples run on the opening drawing (${good}/${HK.examples().length})`, !bad.length, bad.join("\n     "));
}

for (const f of fails) console.log("FAIL " + f);
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
