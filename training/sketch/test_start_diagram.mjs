// test_start_diagram.mjs: the opening drawing (docs/js/start-diagram.js) and z-order with layers (design: LEGEND_EXT.md sections 2 and 5).
//  1. The wires parse, use only keys of the legend, and run without an error; the z-order is the wires' order and never goes down a level
//     (background < zones < items < texts); the groups hold each zone with its items.
//  2. New items go on top of their own band (an item below the texts, a zone below the items, a template's background below the zones).
//  3. toFront / toBack of a shape, of the background and of a group (its members keep their order), undone in one step; the Rules reader
//     writes these wires.
//  4. Backgrounds and zones are not obstacles: a new shape is placed on them; arrange / align ignore them when items are there too.
//  5. Free text: create, move, recolour, resize, relabel, delete; it cannot be connected or turned into a shape.
//  6. A template on the opening drawing: one group, one undo, its z-bands.
//  7. The layout commands people type ("arrange all in a circle", "align everything horizontally", "distribute all vertically", "tidy up",
//     "make it a tree", "arrange all in a grid", ...) on the opening drawing: one layout of all the shapes (a circle of 4 is a circle, a
//     vertical distribute is evenly spaced), nothing drawn overlaps (shapes, name tags, texts, group names), the texts stay put or the reply
//     says they moved aside, and the reply names the shapes taken off their zone.
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
// ---------- 7. the layout commands people type, on the opening drawing: one layout of all the shapes, nothing drawn overlaps ----------
// What is drawn (ui.js): each shape's body; its name tag above it (11 px mono, 7 px above, 12 px when highlighted: both covered), not for
// a free text, a template's shape or a panel (panels show no name tag); a free text's box; each group's name where K.groupLabels puts it
// (above its frame, or the first free corner).
// A re-layout of the whole drawing lays the shapes out as ONE set (one circle, one tree), the texts stay put (or move aside when a shape
// would lie on them), and the reply names the shapes taken off their zone (a shape is on the zone its centre lies on; logic.js alRun).
{
  const tagBox = s => { const d = K.dims(s), w = String(s.name).length * 6.7; return { x1: s.x - w / 2, x2: s.x + w / 2, y1: s.y - d.h / 2 - 23, y2: s.y - d.h / 2 - 4 }; };
  const drawn = S => {
    const out = [], st = S.world.state;
    for (const s of st.shapes) {
      if (s.layer) continue;
      const d = K.dims(s); out.push({ n: (s.shape === "text" ? "text " : "shape ") + s.name, x1: s.x - d.w / 2, x2: s.x + d.w / 2, y1: s.y - d.h / 2, y2: s.y + d.h / 2 });
      if (s.shape !== "text" && !s.quiet) out.push(Object.assign({ n: "tag " + s.name }, tagBox(s)));
    }
    for (const q of K.groupLabels(st)) out.push({ n: "group name " + q.name, x1: q.x1, x2: q.x2, y1: q.y1, y2: q.y2 });   // where ui.js writes it
    return out;
  };
  const overlaps = (S, noGroups) => { const b = drawn(S).filter(x => !noGroups || !x.n.startsWith("group name")), bad = []; for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) if (Math.min(b[i].x2, b[j].x2) - Math.max(b[i].x1, b[j].x1) > 0.5 && Math.min(b[i].y2, b[j].y2) - Math.max(b[i].y1, b[j].y1) > 0.5) bad.push(`${b[i].n} / ${b[j].n}`); return bad; };
  const inside = (S, a, z) => { const da = K.dims(a), dz = K.dims(z); return a.x - da.w / 2 >= z.x - dz.w / 2 && a.x + da.w / 2 <= z.x + dz.w / 2 && a.y - da.h / 2 - (a.shape === "text" ? 0 : 23) >= z.y - dz.h / 2 && a.y + da.h / 2 <= z.y + dz.h / 2; };
  const homes = { Start: "IntakeZone", Process: "IntakeZone", IntakeCaption: "IntakeZone", Check: "ReviewZone", Done: "ReviewZone", ReviewCaption: "ReviewZone" };
  const outOfZone = S => Object.entries(homes).filter(([n, z]) => !inside(S, S.world.find(n), S.world.find(z))).map(([n]) => n);
  const texts = S => S.world.state.shapes.filter(s => s.shape === "text").map(s => `${s.name}@${s.x},${s.y}`).join(" ");
  const S0 = fresh();
  ok("the opening drawing: no shape, text, name tag or group name overlaps another", !overlaps(S0).length, overlaps(S0).join("; "));
  ok("the opening drawing: every shape (with its name tag) and caption inside its zone", !outOfZone(S0).length, outOfZone(S0).join(", "));
  const centreOff = S => Object.entries(homes).filter(([n, z]) => { const a = S.world.find(n), q = S.world.find(z), d = K.dims(q); return Math.abs(a.x - q.x) > d.w / 2 || Math.abs(a.y - q.y) > d.h / 2; }).map(([n]) => n);
  const textAt = S => Object.fromEntries(S.world.state.shapes.filter(s => s.shape === "text").map(s => [s.name, `${s.x},${s.y}`]));
  const run7 = c => { const S = fresh(), t0 = textAt(S), x = say(S, c), st = x.r.steps.filter(s => s.node.type === "command").pop() || {}; return { S, x, t0, msg: st.answer || (st.error && st.error.message) || "" }; };
  const CMDS = ["arrange all in a circle", "align everything horizontally", "distribute all vertically", "tidy up", "make it a tree", "arrange all in a grid",
    "align everything to the left", "more space between the shapes", "make it more compact", "flip the diagram horizontally", "sort by name", "group them by colour", "untangle the arrows",
    "distribute Start, Process, Check and Done vertically", "arrange Start, Process, Check and Done in a circle", "align Start, Process, Check and Done vertically", "Distribute Start, Process and Check"];
  for (const c of CMDS) {
    const { S, x, t0, msg } = run7(c), now = textAt(S), moved = Object.keys(t0).filter(n => t0[n] !== now[n]), gone = centreOff(S).filter(n => S.world.find(n).shape !== "text");
    ok(`"${c}": done, no overlap (shapes, texts, name tags, group names)`, x.r.ok && !overlaps(S).length, overlaps(S).join("; ") + " | " + msg);
    ok(`"${c}": the texts stay where they are, unless the reply says they moved aside`, moved.every(n => new RegExp(`moved the texts? [^.]*\\b${n}\\b[^.]* aside`).test(msg)), `${moved.join(", ")} | ${msg}`);
    ok(`"${c}": the reply names every shape it took off its zone`, gone.every(n => new RegExp(`\\b${n}\\b[^.]*no longer on ${homes[n]}`).test(msg)), `${gone.join(", ")} | ${msg}`);
  }
  { const { S, msg } = run7("arrange all in a circle"), ps = ["Start", "Process", "Check", "Done"].map(n => S.world.find(n));
    const cx = ps.reduce((t, s) => t + s.x, 0) / 4, cy = ps.reduce((t, s) => t + s.y, 0) / 4, rs = ps.map(s => Math.hypot(s.x - cx, s.y - cy)), an = ps.map(s => Math.atan2(s.y - cy, s.x - cx)).sort((a, b) => a - b);
    const steps = an.map((a, i) => ((i ? a - an[i - 1] : a + 2 * Math.PI - an[3]) * 180 / Math.PI));
    ok('"arrange all in a circle": ONE circle of the four shapes (same distance from the centre, a quarter turn apart)', /Arranged 4 shapes as a circle/.test(msg) && Math.max(...rs) - Math.min(...rs) <= 2 && steps.every(d => Math.abs(d - 90) <= 3), `r ${rs.map(Math.round)} steps ${steps.map(Math.round)} | ${msg}`); }
  { const { S, msg } = run7("distribute all vertically"), ps = ["Start", "Process", "Check", "Done"].map(n => S.world.find(n)).sort((a, b) => a.y - b.y);
    const gaps = ps.slice(1).map((s, i) => (s.y - K.dims(s).h / 2 - 22) - (ps[i].y + K.dims(ps[i]).h / 2));
    ok('"distribute all vertically": the four shapes one below the other, equal gaps (name tags included), no overlap', /Spaced 4 shapes evenly from top to bottom/.test(msg) && Math.max(...gaps) - Math.min(...gaps) <= 1 && Math.min(...gaps) >= 15 && !overlaps(S).length, `gaps ${gaps.map(Math.round)} | ${msg}`); }
  { const { S } = run7("make it a tree"), y = n => S.world.find(n).y, x = n => S.world.find(n).x, ch = ["Start", "Process", "Check", "Done"];
    // a chain of four is too tall for the canvas top-down without squeezing (shapes + name tags + level gaps > 466 px): the tree then goes
    // left to right, the direction in which it fits (auto-layout.js layout: the direction is chosen by fit when none is asked)
    const down = ch.every((n, i) => !i || y(ch[i - 1]) < y(n)), right = ch.every((n, i) => !i || x(ch[i - 1]) < x(n));
    ok('"make it a tree": one tree, Start before Process before Check before Done (top-down, or left to right when that fits better)', down || right, ch.map(n => x(n) + "," + y(n)).join(" ")); }
  { const { S } = run7("align everything horizontally");
    ok('"align everything horizontally": the four shapes on one line', new Set(["Start", "Process", "Check", "Done"].map(n => S.world.find(n).y)).size === 1); }
}
// ---------- 8. the owner's session of 2026-11-03 (sop-requests-2026-11-03-1303.jsonl, spoken in Romanian, translated): its layout commands,
// typed in English, on the opening drawing plus a triangle, a diamond and a circle. After every command: no shape, name tag or text
// overlaps another, no arrow is drawn through a shape, a name tag or a text (logic.js edgeRoutes), everything is on the canvas; a
// re-layout never ends below the score the drawing had before it was laid out, and "tidy up" never lowers it.
{
  const AL = require("../../docs/js/auto-layout.js");
  const tagBox = s => { const d = K.dims(s), w = String(s.name).length * 6.7; return { x1: s.x - w / 2, x2: s.x + w / 2, y1: s.y - d.h / 2 - 23, y2: s.y - d.h / 2 - 4 }; };
  const drawn = st => { const out = []; for (const s of st.shapes) { if (s.layer) continue; const d = K.dims(s); out.push({ n: s.name, x1: s.x - d.w / 2, x2: s.x + d.w / 2, y1: s.y - d.h / 2, y2: s.y + d.h / 2 }); if (s.shape !== "text" && !s.quiet) out.push(Object.assign({ n: "tag " + s.name, of: s.name }, tagBox(s))); } return out; };
  const overlapsOf = st => { const b = drawn(st), bad = []; for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) if (b[i].of !== b[j].n && b[j].of !== b[i].n && Math.min(b[i].x2, b[j].x2) - Math.max(b[i].x1, b[j].x1) > 0.5 && Math.min(b[i].y2, b[j].y2) - Math.max(b[i].y1, b[j].y1) > 0.5) bad.push(`${b[i].n} / ${b[j].n}`); return bad; };
  // a drawn arrow (its route: centre, bends, centre) through a box that is not one of its ends (shrunk by 2 px, as the score counts it)
  const through = st => { const R = K.edgeRoutes(st), bad = [], b = drawn(st);
    const segHit = (p, q, o) => { const x1 = o.x1 + 2, x2 = o.x2 - 2, y1 = o.y1 + 2, y2 = o.y2 - 2; let t0 = 0, t1 = 1; const dx = q.x - p.x, dy = q.y - p.y;
      for (const [pp, qq] of [[-dx, p.x - x1], [dx, x2 - p.x], [-dy, p.y - y1], [dy, y2 - p.y]]) { if (pp === 0) { if (qq < 0) return false; continue; } const r = qq / pp; if (pp < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } } return t0 < t1; };
    for (const e of st.edges) { const a = st.shapes.find(s => s.name === e.from), z = st.shapes.find(s => s.name === e.to), pts = [a].concat((R[e.id] || {}).points || [], [z]);
      for (let i = 0; i + 1 < pts.length; i++) for (const o of b) { const end = o.n === e.from || o.n === e.to || o.of === e.from || o.of === e.to; if (end && (i === 0 && (o.n === e.from || o.of === e.from) || i + 2 === pts.length && (o.n === e.to || o.of === e.to))) continue; if (end && pts.length === 2) continue; if (segHit(pts[i], pts[i + 1], o)) bad.push(`${e.from}→${e.to} through ${o.n}`); } }
    return [...new Set(bad)]; };
  const offCanvas = st => st.shapes.filter(s => !s.layer).filter(s => { const d = K.dims(s), t = s.shape !== "text" && !s.quiet ? 23 : 0; return s.x - d.w / 2 < 0 || s.x + d.w / 2 > 800 || s.y - d.h / 2 - t < 0 || s.y + d.h / 2 > 500; }).map(s => s.name);
  const scoreOf = st => AL.score(st.shapes.filter(s => !s.layer).map(s => { const d = K.dims(s), t = s.shape !== "text" && !s.quiet ? 22 : 0; return { name: s.name, x: s.x, y: s.y - t / 2, w: d.w, h: d.h + t }; }), st.edges).score;
  const S = fresh();
  for (const c of ["draw a yellow triangle", "draw a diamond near Check", "draw a circle"]) say(S, c);
  ok("session: the opening drawing plus a triangle, a diamond and a circle (10 items)", ["triangle1", "diamond1", "circle1"].every(n => S.world.find(n)));
  const LAYOUT = new Set(["arrange all in a circle", "arrange all as a triangle", "tidy up", "layout", "improve layout"]);
  let before = scoreOf(S.world.state);
  for (const c of ["arrange all in a circle", "connect all items", "arrange all as a triangle", "tidy up", "layout", "improve layout"]) {
    const s0 = scoreOf(S.world.state), x = say(S, c), st = S.world.state, s1 = scoreOf(st), msg = x.r.steps.map(q => q.answer || (q.error && q.error.message) || "").join(" ");
    ok(`session "${c}": no shape, name tag or text overlaps another`, !overlapsOf(st).length, overlapsOf(st).join("; ") + " | " + msg);
    ok(`session "${c}": no arrow drawn through a shape, a name tag or a text`, !through(st).length, through(st).join("; "));
    ok(`session "${c}": everything on the canvas`, !offCanvas(st).length, offCanvas(st).join(", "));
    ok(`session "${c}": does not say it is crowded`, !/do not all fit/.test(msg), msg);
    if (c === "tidy up" || c === "improve layout") ok(`session "${c}": the score does not go down (${s0} -> ${s1})`, s1 >= s0 - 0.05, msg);
    if (LAYOUT.has(c)) ok(`session "${c}": scores at least 90 (${s1})`, s1 >= 90, msg);
    console.log(`     session "${c}": score ${s0} -> ${s1} | ${msg}`);
  }
  { const T = fresh(); for (const c of ["draw a yellow triangle", "draw a diamond near Check", "draw a circle"]) say(T, c);
    const x = say(T, "layout"), msg = x.r.steps.map(q => q.answer || "").join(" ");
    ok('session turn 9 ("change the layout" with 3 unlinked shapes): a tree of the linked four, the three set beside it, and the reply says so', /triangle1, diamond1 and circle1 have no links/.test(msg) && !overlapsOf(T.world.state).length && !offCanvas(T.world.state).length, msg); }
  const z = S.world.find("IntakeZone"), zd = K.dims(z);
  ok("session: after the re-layouts, IntakeZone is fitted round its own shapes, no longer covering the drawing", zd.w * zd.h < 330 * 330, `${zd.w}x${zd.h}`);
}
for (const f of fails) console.log("FAIL " + f);
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
