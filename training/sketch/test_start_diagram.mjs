// test_start_diagram.mjs: the opening drawing (docs/js/start-diagram.js) and z-order with layers (design: LEGEND_EXT.md sections 2 and 5).
//  1. The wires parse, use only keys of the legend, and run without an error; the z-order is the wires' order and never goes down a level
//     (background < zones < items < texts); the groups hold each zone with its items.
//  2. New items go on top of their own band (an item below the texts, a zone below the items, a template's background below the zones).
//  3. toFront / toBack of a shape, of the background and of a group (its members keep their order), undone in one step; the Rules reader
//     writes these wires.
//  4. Backgrounds and zones are not obstacles: a new shape is placed on them; arrange / align ignore them when items are there too.
//  5. Free text: create, move, recolour, resize, relabel, delete; it cannot be connected or turned into a shape.
//  6. A template on the opening drawing: one group, one undo, its z-bands.
// Run: node training/sketch/test_start_diagram.mjs   (exit code 1 on a failure)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const K = require("../../docs/js/logic.js"), SD = require("../../docs/js/start-diagram.js");
let fail = 0, n = 0; const fails = [];
const ok = (name, cond, detail) => { n++; if (!cond) { fail++; fails.push(name + (detail ? `\n     ${detail}` : "")); } else console.log("ok   " + name); };
const fresh = () => { const S = K.createSystem(); const r = S.engine.run(K.parse(SD.SOP)); S.first = r; S.world.undoStack = []; return S; };
const order = S => S.world.state.shapes.map(s => s.name);
const run = (S, sop) => S.engine.run(K.parse(sop));
const say = (S, text) => { const f = S.formalize(text, { names: order(S).concat(S.world.state.groups.map(g => g.name)), last: [] }); return { f, r: S.engine.run(f.nodes) }; };
const level = s => s.layer === "background" ? 0 : s.layer === "zone" ? 1 : s.shape === "text" ? 3 : 2;

// ---------- 1. the drawing ----------
{
  const S = fresh(), nodes = K.parse(SD.SOP);
  ok("the wires parse", nodes.length === SD.WIRES.length);
  const warns = nodes.flatMap(nd => S.engine.legend.validate(nd)).map(i => i.msg);
  ok("every key and value is in the legend", !warns.length, warns.join("; "));
  ok("the wires run without an error", S.first.ok, (S.first.errors[0] || { error: {} }).error.message);
  const names = order(S), want = SD.WIRES.filter(w => /action=create/.test(w)).map(w => /name=(\w+)/.exec(w)[1]);
  ok("z-order = the order of the wires (back to front)", JSON.stringify(names) === JSON.stringify(want), names.join(","));
  const lv = S.world.state.shapes.map(level);
  ok("levels never go down along the z-order (background, zones, items, texts)", lv.every((x, i) => !i || x >= lv[i - 1]) && lv.join("") === S.world.state.shapes.map(s => SD.LEVELS[s.name]).join(""), lv.join(""));
  ok("three levels below the texts: background, zones, items", new Set(lv).size === 4);
  for (const [g, m] of Object.entries(SD.GROUPS)) ok(`group ${g} holds ${m.join(", ")}`, JSON.stringify((S.world.findGroup(g) || {}).members) === JSON.stringify(m));
  ok("three arrows: Start -> Process -> Check -> Done (dashed, yes)", S.world.state.edges.map(K.edgeText).join("; ") === 'Start → Process; Process → Check; Check → Done (dashed) "yes"');
  const inside = (a, b) => { const da = K.dims(a), db = K.dims(b); return a.x - da.w / 2 >= b.x - db.w / 2 && a.x + da.w / 2 <= b.x + db.w / 2 && a.y - da.h / 2 >= b.y - db.h / 2 && a.y + da.h / 2 <= b.y + db.h / 2; };
  const f = nm => S.world.find(nm);
  ok("each zone lies on the background; each item and caption lies inside its zone", ["IntakeZone", "ReviewZone"].every(z => inside(f(z), f("Backdrop"))) && ["Start", "Process", "IntakeCaption"].every(x => inside(f(x), f("IntakeZone"))) && ["Check", "Done", "ReviewCaption"].every(x => inside(f(x), f("ReviewZone"))));
  ok("the path question of the first message is answered yes", /^Yes: Start → Process → Check → Done/.test(say(S, SD.MESSAGES[0]).r.steps.pop().answer));
}
// ---------- 2. new items on top of their band ----------
{
  const S = fresh();
  run(S, "@a command action=create shape=circle name=Hub");
  ok("a new item goes above the items, below the texts", order(S).indexOf("Hub") === order(S).indexOf("MainTitle") - 1);
  run(S, "@a command action=create shape=rectangle name=Lane layer=zone fill=light width=200 height=80 position=bottom");
  ok("a new zone goes above the zones, below the items", order(S).indexOf("Lane") === order(S).indexOf("ReviewZone") + 1);
  run(S, '@a command action=create shape=text name=Note label="draft"');
  ok("a new text goes on top", order(S).at(-1) === "Note");
}
// ---------- 3. toFront / toBack ----------
{
  const S = fresh(), before = order(S);
  run(S, "@a command action=toFront target=Backdrop");
  ok("bring Backdrop to the front: it is drawn last", order(S).at(-1) === "Backdrop");
  run(S, "@u command action=undo");
  ok("undo restores the z-order", JSON.stringify(order(S)) === JSON.stringify(before));
  run(S, "@a command action=toBack target=Start");
  ok("send Start to the back: behind the background (a faint fill, so it still shows)", order(S)[0] === "Start" && S.world.find("Backdrop").fill === "faint");
  const T = fresh(); run(T, "@a command action=toFront target=Intake");
  const tail = order(T).slice(-4);
  ok("bring the group Intake to the front: its four members on top, in their own order (zone behind its items)", JSON.stringify(tail) === JSON.stringify(SD.GROUPS.Intake), tail.join(","));
  run(T, "@a command action=toBack target=Review");
  ok("send the group Review to the back: its members first, in their own order", JSON.stringify(order(T).slice(0, 4)) === JSON.stringify(SD.GROUPS.Review), order(T).slice(0, 4).join(","));
  run(T, "@u command action=undo");
  ok("one undo takes back the whole group move", JSON.stringify(order(T).slice(-4)) === JSON.stringify(SD.GROUPS.Intake));
  const R = fresh();
  ok("Rules: 'Send Start to the back' -> toBack target=Start", K.serialize(say(R, "Send Start to the back").f.nodes[0]) === "@s1 command action=toBack target=Start");
  ok("Rules: 'Bring Intake to the front' -> toFront target=Intake", K.serialize(say(R, "Bring Intake to the front").f.nodes[0]) === "@s1 command action=toFront target=Intake");
}
// ---------- 4. panels are not obstacles ----------
{
  const S = fresh(); run(S, "@a command action=create shape=circle name=Hub position=center");
  const h = S.world.find("Hub");
  ok("a circle asked for the centre is placed at the centre, on the background and the zones", h.x === 400 && h.y === 250, `${h.x},${h.y}`);
  const T = fresh(), z = { ...T.world.find("IntakeZone") }; run(T, "@a command action=arrange target=IntakeZone,Start,Process layout=row");
  ok("arrange with a zone among items moves the items only", T.world.find("IntakeZone").x === z.x && T.world.find("IntakeZone").y === z.y);
  const U = fresh(); say(U, "Arrange everything in a grid");
  ok("arrange everything leaves the background and the zones in place", U.world.find("Backdrop").x === 400 && U.world.find("ReviewZone").x === 575);
}
// ---------- 5. free text ----------
{
  const S = fresh();
  const a = say(S, 'Add a title "Q3 roadmap" at the top in big red letters');
  const t = S.world.state.shapes.find(s => s.shape === "text" && s.label === "Q3 roadmap");
  ok("Rules + engine: a free text, large, red, at the top", t && t.color === "red" && K.sizeName(t.size) === "large" && t.y < 167, a.f.nodes.map(K.serialize).join(" ; "));
  const nm = t.name;
  run(S, `@m command action=move target=${nm} position=bottomRight`); ok("move a text", S.world.find(nm).x > 533 && S.world.find(nm).y > 333);
  run(S, `@m command action=set target=${nm} color=blue size=huge`); ok("recolour and resize a text (font from the size)", S.world.find(nm).color === "blue" && K.fontOf(S.world.find(nm)) === 36);
  run(S, `@m command action=label target=${nm} label="Q4 roadmap"`); ok("relabel a text: its text changes, its box follows", S.world.find(nm).label === "Q4 roadmap" && K.dims(S.world.find(nm)).w > 100);
  const c = run(S, `@c command action=connect from=${nm} to=Start`); ok("a text cannot be connected", !c.ok && /is a text/.test(c.errors[0].error.message));
  const d = run(S, `@c command action=set target=${nm} shape=circle`); ok("a text cannot become a shape", !d.ok && /a text can't become/.test(d.errors[0].error.message));
  run(S, `@d command action=delete target=${nm}`); ok("delete a text", !S.world.find(nm));
  ok("a create of a text without words asks for them", /What should the text say/.test(run(S, "@a command action=create shape=text").errors[0].error.message));
  const w = say(fresh(), 'Write "Draft" in the bottom right').f.nodes.map(K.serialize).join(" ; ");
  ok("Rules: 'Write \"Draft\" in the bottom right' -> a text there", w === '@s1 command action=create shape=text label=Draft position=bottomRight', w);
  const l = say(fresh(), 'Label Done "finish"').f.nodes.map(K.serialize).join(" ; ");
  ok("Rules: 'Label Done \"finish\"' stays a label of Done", l === '@s1 command action=label label=finish target=Done', l);
}
// ---------- 6. a template on the opening drawing ----------
{
  const S = fresh(), n0 = S.world.state.shapes.length;
  const r = run(S, '@t command action=create template=mountain items=Idea,Prototype,Beta,Launch title="Our climb"');
  const g = S.world.findGroup("OurClimb");
  ok("a template: one group named after its title", r.ok && g && g.members.length === S.world.state.shapes.length - n0, r.ok ? "" : r.errors[0].error.message);
  const mi = order(S).indexOf("OurClimb-mountain"), first = Math.min(...g.members.filter(m => m !== "OurClimb-mountain").map(m => order(S).indexOf(m)));
  ok("its background element is in the background band, behind its items", S.world.find("OurClimb-mountain").layer === "background" && mi < first && mi < order(S).indexOf("IntakeZone"));
  ok("its items are named after their texts", ["Idea", "Prototype", "Beta", "Launch"].every(x => S.world.find(x)));
  run(S, "@u command action=undo");
  ok("one undo removes the whole template", S.world.state.shapes.length === n0 && !S.world.findGroup("OurClimb"));
}
for (const f of fails) console.log("FAIL " + f);
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
