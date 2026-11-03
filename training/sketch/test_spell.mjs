// test_spell.mjs: the VSA spell checker (docs/js/spell.js) with the demo's vocabulary (docs/model/spell/vocab.json + the legend).
// Checks the names a message introduces (declaredNames): such a name is known for the rest of the message, so it is not "corrected" toward a
// similar canvas name (bug of 2026-11-03: "... named RoboHand. Connect RoboBody to RoboHand ..." became "... to RoboHead"), and a later
// typo of it is corrected toward it. Also the behaviour that must not change: a canvas-name typo is still corrected.
//   node training/sketch/test_spell.mjs        exit code 0 when every check passes
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ROOT = new URL("../../", import.meta.url).pathname;
const SK = require(ROOT + "docs/js/spell.js"), K = require(ROOT + "docs/js/logic.js"), V = require(ROOT + "docs/model/spell/vocab.json");
const sp = SK.create({ params: V.params, words: V.words.concat(SK.legendWords(K.createSystem().engine.legend)), keep: V.keep || [] });
const ROBOT = ["RoboHead", "RoboBody", "RoboEye", "RoboEye2"];
let fails = 0;
const check = (name, ok, detail) => { console.log((ok ? "ok   " : "FAIL ") + name + (ok ? "" : "\n     " + detail)); if (!ok) fails++; };
const run = (text, names) => sp.check(text, { names });

let r = run("Add a small gray circle named RoboHand. Connect RoboBody to RoboHand with a plain line.", ROBOT);
check("a name declared with 'named' is not corrected later in the message", r.text.endsWith("Connect RoboBody to RoboHand with a plain line.") && !r.fixes.length, JSON.stringify(r));
r = run("Add a circle named RoboHand. Connect RoboBody to Robohnd.", ROBOT);
check("a typo of a declared name is corrected toward it", r.text === "Add a circle named RoboHand. Connect RoboBody to RoboHand.", JSON.stringify(r));
r = run("Small blue square, call it RoboHand. Then join RoboHand to RoboBody.", ROBOT);
check("'call it X' declares a name", !r.fixes.length, JSON.stringify(r));
r = run("Hand: a blue square at 300,200. Name: RoboHand. Put RoboHand next to RoboBody.", ROBOT);
check("'Name: X' declares a name", !r.fixes.length, JSON.stringify(r));
r = run("Connect RoboBody to RoboHaed.", ROBOT);
check("a typo of a canvas name is still corrected", r.text === "Connect RoboBody to RoboHead.", JSON.stringify(r));
r = run("Make the cirlce gren.", []);
check("ordinary typos are still corrected", r.text === "Make the circle green.", JSON.stringify(r));
check("declaredNames: named / called / name it / call that one / Name: / name X", JSON.stringify(SK.declaredNames("a named A1, called Bee, name it Core, call that one CowHead. Name: Kitchen, layer, name Sheet, called it").map(d => d.name)) === JSON.stringify(["A1", "Bee", "Core", "CowHead", "Kitchen", "Sheet"]), JSON.stringify(SK.declaredNames("a named A1, called Bee, name it Core, call that one CowHead. Name: Kitchen, layer, name Sheet, called it")));
console.log(fails ? `FAILED: ${fails}` : "all checks passed");
process.exit(fails ? 1 : 0);
