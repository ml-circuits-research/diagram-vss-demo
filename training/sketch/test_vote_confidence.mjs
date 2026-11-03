// test_vote_confidence.mjs: parity of the browser code of the three-reader vote (docs/js/vote-confidence.js) with the script that fitted it
// (training/sketch/confidence3/fit3.mjs), on the fixture training/sketch/confidence3/vote3_parity.json (written by fit3.mjs EXPORT=1: the first
// 60 test-part messages of fresh2, the readings and signals as the page has them, and the script's confidence of every request of the columns
// vss, sop, vote3 and the vote count of the weight-free rule). other_conf (vote3's sop part) is computed here as in the page:
// docs/js/vss-confidence.js with docs/model/confidence/vss.json. Also: engineNorm on hand-made examples.
//   node training/sketch/test_vote_confidence.mjs [vote3.json] [fixture]
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, "../..");
const MODEL = JSON.parse(readFileSync(process.argv[2] || path.join(ROOT, "docs/model/confidence/vote3.json"), "utf8"));
const FX = JSON.parse(readFileSync(process.argv[3] || path.join(HERE, "confidence3/vote3_parity.json"), "utf8"));
const VSSJ = JSON.parse(readFileSync(path.join(ROOT, "docs/model/confidence/vss.json"), "utf8"));
const VT = await import(pathToFileURL(path.join(ROOT, "docs/js/vote-confidence.js")).href);
const VC = await import(pathToFileURL(path.join(ROOT, "docs/js/vss-confidence.js")).href);

let fails = 0;
const check = (name, ok, detail = "") => { console.log((ok ? "ok   " : "FAIL ") + name + (ok || !detail ? "" : "\n     " + detail)); if (!ok) fails++; };

const runs = {
  vss: (m) => VT.columnVss(MODEL, { text: m.text, names: m.names, ...m.vss }),
  sop: (m) => VT.columnSop(MODEL, { text: m.text, names: m.names, sop: m.bert.sop, vss: m.bert.vss, rules: m.bert.rules, rulesMsg: m.bert.rulesMsg }),
  vote3: (m) => VT.vote3(MODEL, { text: m.text, names: m.names, ...m.bert, vss: m.bert.vss.map((v) => Object.assign({}, v, { conf: VC.confidence(VSSJ, v.f, v.world) })) }),
  vote3_rule: (m) => VT.vote3(MODEL, { text: m.text, names: m.names, ...m.bert, vss: m.bert.vss.map((v) => Object.assign({}, v, { conf: 0 })) }, "cost", true)
};
for (const [col, run] of Object.entries(runs)) {
  let n = 0, maxd = 0, sameSet = 0, msgs = 0, sameN = 0;
  for (const m of FX.messages) {
    const exp = m.expect[col], got = run(m); msgs++;
    const key = (x) => `${x.from}:${x.j}`, G = new Map(got.map((x) => [key(x), x]));
    if (got.length === exp.length && exp.every((e) => G.has(key(e)))) sameSet++;
    for (const e of exp) { const x = G.get(key(e)); n++; if (!x) continue; if (x.n_agree === e.n) sameN++; if (e.conf !== undefined) maxd = Math.max(maxd, Math.abs(x.conf - e.conf)); }
  }
  check(`${col}: the same requests (and whose reading) on ${sameSet} of ${msgs} messages`, sameSet === msgs);
  check(`${col}: the same vote count n_agree on ${sameN} of ${n} requests`, sameN === n);
  if (col !== "vote3_rule") check(`${col}: max |confidence, browser code − script| = ${maxd.toExponential(2)} over ${n} requests`, n >= 60 && maxd < 1e-9);
}
// thresholds by level and type come from the file
{ const L = MODEL.columns.vote3.levels.cost, t = VT.thresholdOf(MODEL.columns.vote3.levels, "cost", "question:count"), tc = VT.thresholdOf(MODEL.columns.vote3.levels, "cost", "command:move");
  check("thresholdOf: per-type thresholds of the file", t === (L.question ?? L.all) && tc === (L.command ?? L.all)); }
// engineNorm: arrange / distribute targets as sets, "no target" = mention(quantifier=all) = every canvas name; nothing else
{
  const N = ["Start", "Check", "Done", "Retry"];
  const a = VT.engineNorm({ action: "arrange", layout: "circle" }, "command:arrange", N), b = VT.engineNorm({ action: "arrange", layout: "circle", target: "check,done,retry,start" }, "command:arrange", N);
  const c = VT.engineNorm({ action: "distribute", axis: "vertical", target: "mention(quantifier=all)" }, "command:distribute", N);
  const d = VT.engineNorm({ action: "arrange", target: "done,start" }, "command:arrange", N), e = VT.engineNorm({ action: "arrange", target: "start,done" }, "command:arrange", N);
  const f = VT.engineNorm({ action: "align", target: "done,start" }, "command:align", N), g = VT.engineNorm({ action: "arrange", target: "mention(quantifier=all,shape=star)" }, "command:arrange", N);
  check("engineNorm: no target = mention(quantifier=all) = every canvas name; order-free for arrange; align and filtered mentions unchanged",
    a.target === "*all*" && b.target === "*all*" && c.target === "*all*" && d.target === e.target && d.target === "done,start" && f.target === "done,start" && g.target === "mention(quantifier=all,shape=star)",
    JSON.stringify([a, b, c, d, e, f, g]));
}
// the demo's agreement (opts.agreement = "engine", docs/js/ui.js): on the fixture, how many execute decisions of the columns differ from the
// file's own agreement (reported; RESULT.md: d1 changes no calibration pair), and a hand-made arrange / distribute message where it matters
{
  const E = { agreement: "engine" };
  let n = 0, diff = 0;
  for (const m of FX.messages) {
    for (const [a, b] of [[runs.vss(m), VT.columnVss(MODEL, { text: m.text, names: m.names, ...m.vss }, "cost", E)],
      [runs.sop(m), VT.columnSop(MODEL, { text: m.text, names: m.names, sop: m.bert.sop, vss: m.bert.vss, rules: m.bert.rules, rulesMsg: m.bert.rulesMsg }, "cost", E)]]) {
      a.forEach((x, i) => { n++; if (x.execute !== b[i].execute) diff++; });
    }
  }
  check(`engine agreement on the fixture: ${diff} of ${n} execute decisions of the VSS and SOP-BERT columns differ from the file's agreement (reported)`, n > 0);
  const text = "arrange all in a circle", names = ["Start", "Check", "Done", "Retry"], sp = [0, text.length], f0 = FX.messages[0];
  const sopF = f0.bert.sop[0].f, vssF = f0.vss.vss[0].f;
  const m = { text, names, sop: [{ pa: "command:arrange", got: { action: "arrange", layout: "circle", target: "check,done,retry,start" }, span: sp, args0: { action: "arrange" }, f: sopF, act: "arrange" }],
    vss: [{ pa: "command:arrange", got: { action: "arrange", layout: "circle", target: "mention(quantifier=all)" }, span: sp, args0: { action: "arrange" }, f: vssF, world: f0.vss.vss[0].world, conf: 0.5 }],
    rules: [{ pa: "command:arrange", got: { action: "arrange", layout: "circle" }, span: sp, args0: { action: "arrange" }, notes: 0 }], rulesMsg: { msgNotes: 0, unread: 0 } };
  const ruleV = VT.vote3(MODEL, m, "cost", true)[0], canonS = VT.columnSop(MODEL, m)[0], engS = VT.columnSop(MODEL, m, "cost", E)[0];
  check("engine agreement: “arrange all in a circle” as a list of every name, mention(all) and no target: 3/3 for the rule (the file says engine) and for columnSop with opts (the file's canon: 1/3)",
    ruleV.n_agree === 3 && ruleV.execute && engS.n_agree === 3 && canonS.n_agree === 1, JSON.stringify([ruleV, canonS, engS]));
  const cv = VT.columnVss(MODEL, m, "cost", E)[0];
  check("columnVss: the partners of the votes are returned (for the reasons)", cv.partner_sop === 0 && cv.partner_rules === 0 && cv.agree_sop === 1 && cv.agree_rules === 1, JSON.stringify(cv));
}
// engineTargets: on a drawing with groups and panels (the demo's opening drawing), a list of every name = "all"
{
  const view = { groups: new Map([["intake", ["intakezone", "start", "process", "intakecaption"]], ["review", ["reviewzone", "check", "done", "reviewcaption"]]]), panels: new Set(["backdrop", "intakezone", "reviewzone"]) };
  const all = ["Start", "Process", "Check", "Done", "MainTitle", "IntakeCaption", "ReviewCaption"];
  const every = VT.engineTargets({ pa: "command:distribute", got: { action: "distribute", target: "backdrop,check,done,intake,intakecaption,intakezone,maintitle,process,review,reviewcaption,reviewzone,start" } }, view);
  const groups = VT.engineTargets({ pa: "command:arrange", got: { action: "arrange", target: "intake,review,maintitle" } }, view);
  const four = VT.engineTargets({ pa: "command:arrange", got: { action: "arrange", target: "start,process,check,done" } }, view);
  const align = VT.engineTargets({ pa: "command:align", got: { action: "align", target: "intake" } }, view);
  const zones = VT.engineTargets({ pa: "command:arrange", got: { action: "arrange", target: "reviewzone,intakezone" } }, view);
  check("engineTargets: every canvas name and the groups = every shape; four items stay four; align and a list of panels only unchanged",
    VT.engineNorm(every.got, every.pa, all).target === "*all*" && VT.engineNorm(groups.got, groups.pa, all).target === "*all*" && VT.engineNorm(four.got, four.pa, all).target === "check,done,process,start"
    && align.got.target === "intake" && zones.got.target === "intakezone,reviewzone", JSON.stringify([every, groups, four, align, zones]));
}
// the forms of 2026-11-02 (confidence3/NEW_FORMS_AUDIT.md): two readings of one request, written the ways logic.js does the same thing,
// agree; written the ways it does different things, do not. The readings go through bench-canon.js canon as the collectors' and the page's do.
{
  const BC = await import(pathToFileURL(path.join(ROOT, "docs/js/bench-canon.js")).href);
  const N = ["Start", "Process", "Check", "Done"];
  const rd = (type, args, mentions = {}) => { const nodes = Object.entries(mentions).map(([id, a]) => ({ id, type: "mention", args: a })), w = { id: "w", type, args };
    return { pa: `${type}:${args.action || args.ask || ""}`, got: BC.canon(w, nodes.concat([w])), span: [0, 10], args0: { action: args.action ?? null, name: null, count: null } }; };
  const ag = (x, y) => VT.agreementOf("0123456789", [x], [y], N, "engine")[0].agree;
  const C = (args, m) => rd("command", args, m), Q = (args) => rd("question", args);
  const yes = [
    ["help: aspect overview = no aspect", Q({ ask: "help", topic: "color", aspect: "overview" }), Q({ ask: "help", topic: "color" })],
    ["help: topic general = no topic", Q({ ask: "help", topic: "general", aspect: "can" }), Q({ ask: "help", aspect: "can" })],
    ["help: about=undefined = no about", Q({ ask: "help", topic: "connect", aspect: "how", about: undefined }), Q({ ask: "help", topic: "connect", aspect: "how" })],
    ["help: about beside a topic is not read", Q({ ask: "help", topic: "text", aspect: "can", about: "images" }), Q({ ask: "help", topic: "text", aspect: "can" })],
    ["improve: no target = mention(quantifier=all)", C({ action: "improve" }), C({ action: "improve", target: { ref: "m1" } }, { m1: { quantifier: "all" } })],
    ["improve: no target = every canvas name", C({ action: "improve" }), C({ action: "improve", target: ["Done", "Check", "Process", "Start"] })],
    ["groupBy / equalize / sort: target list in any order", C({ action: "sort", property: "name", target: ["Check", "Start"] }), C({ action: "sort", property: "name", target: ["Start", "Check"] })],
    ["set kind=edge: quantifier=all is not read", C({ action: "set", kind: "edge", quantifier: "all", style: "dashed" }), C({ action: "set", kind: "edge", style: "dashed" })],
    ["reverse by its ends: a target is not read", C({ action: "reverse", from: "Start", to: "Check" }), C({ action: "reverse", from: "Start", to: "Check", target: "Start" })],
    ["label by its ends: a target is not read", C({ action: "label", from: "Start", to: "Check", label: "yes" }), C({ action: "label", from: "Start", to: "Check", label: "yes", target: "Done" })],
    ["template items: a list = the same texts as one string", C({ action: "create", template: "timeline", items: ["Q1", "Q2"], title: "Plan" }), C({ action: "create", template: "timeline", items: "Q1,Q2", title: "Plan" })],
    ["connect a list: pairing chain = no pairing", C({ action: "connect", from: ["Start", "Process", "Check"], pairing: "chain" }), C({ action: "connect", from: ["Start", "Process", "Check"] })]
  ];
  const no = [
    ["label \"\" (remove) != label null (asks)", C({ action: "label", from: "Start", to: "Check", label: "" }), C({ action: "label", from: "Start", to: "Check", label: null })],
    ["template items in another order", C({ action: "create", template: "cycle", items: ["A", "B", "C"] }), C({ action: "create", template: "cycle", items: ["C", "B", "A"] })],
    ["arrange with a template: target order is read", C({ action: "arrange", template: "timeline", target: ["Start", "Done"] }), C({ action: "arrange", template: "timeline", target: ["Done", "Start"] })],
    ["set from/to swapped (the stated direction is tried first)", C({ action: "set", from: "Start", to: "Check", style: "dashed" }), C({ action: "set", from: "Check", to: "Start", style: "dashed" })],
    ["improve: one shape != the whole drawing", C({ action: "improve" }), C({ action: "improve", target: "Start" })],
    ["help: another topic", Q({ ask: "help", topic: "connect", aspect: "how" }), Q({ ask: "help", topic: "delete", aspect: "how" })],
    ["help: about without a topic is read", Q({ ask: "help", aspect: "can", about: "images" }), Q({ ask: "help", aspect: "can" })],
    ["template: one item less", C({ action: "create", template: "timeline", items: ["Q1", "Q2", "Q3"] }), C({ action: "create", template: "timeline", items: ["Q1", "Q2"] })],
    ["label kind=edge without quantifier=all (asks which arrow) != every arrow", C({ action: "label", kind: "edge", label: "" }), C({ action: "label", kind: "edge", label: "", target: { ref: "m1" } }, { m1: { quantifier: "all" } })],
    ["align without a direction: the first target is the base", C({ action: "align", axis: "horizontal", target: ["Start", "Done"] }), C({ action: "align", axis: "horizontal", target: ["Done", "Start"] })]
  ];
  const badY = yes.filter(([, x, y]) => ag(x, y) !== 1 || ag(y, x) !== 1), badN = no.filter(([, x, y]) => ag(x, y) !== 0 || ag(y, x) !== 0);
  check(`new forms: ${yes.length - badY.length} of ${yes.length} engine-equal pairs agree`, !badY.length, badY.map(([n, x, y]) => `${n}: ${JSON.stringify(x.got)} vs ${JSON.stringify(y.got)}`).join("\n     "));
  check(`new forms: ${no.length - badN.length} of ${no.length} pairs the engine does differently disagree`, !badN.length, badN.map(([n, x, y]) => `${n}: ${JSON.stringify(x.got)} vs ${JSON.stringify(y.got)}`).join("\n     "));
  // the scorer of the collectors: every gold key equal; the gold is the annotation's form (bench-canon.js canonWant)
  const right = (x, type, gold) => Object.entries(BC.canonWant(type, gold)).every(([k, v]) => (x.got[k] ?? "∅") === v);
  check("scorer: \"tidy up\" (gold: no target) read with one shape is not right; read with mention(quantifier=all) is right",
    !right(C({ action: "improve", target: "Start" }), "command", { action: "improve" }) && right(C({ action: "improve", target: { ref: "m1" } }, { m1: { quantifier: "all" } }), "command", { action: "improve" }));
  check("scorer: help gold aspect=overview read without an aspect is right; gold about=images without a topic read without about is not",
    right(Q({ ask: "help", topic: "color" }), "question", { ask: "help", topic: "color", aspect: "overview" }) && !right(Q({ ask: "help", aspect: "can" }), "question", { ask: "help", aspect: "can", about: "images" }));
}
// the reasons in plain words
{
  const N = ["Start", "Check", "Done"];
  const R = (pa, got) => ({ pa, got });
  const w1 = VT.agreementWords("VSS", R("command:arrange", { action: "arrange", target: "check,done,start" }), [{ label: "the Rules", agree: 1, reading: R("command:arrange", { action: "arrange" }) }, { label: "SOP-BERT", agree: 0, reading: R("command:arrange", { action: "arrange", layout: "circle", target: "check,done,start" }) }], N);
  check("agreementWords: “the Rules and VSS agree, SOP-BERT reads … instead …”", w1 === "the Rules and VSS agree, SOP-BERT reads layout ‘circle’ instead of no layout", w1);
  const w2 = VT.agreementWords("SOP-BERT", R("command:set", { action: "set", color: "red", target: "start" }), [{ label: "the Rules", agree: 0, reading: null }, { label: "VSS", agree: 0, reading: R("command:set", { action: "set", color: "blue", target: "start" }) }], N);
  check("agreementWords: no two agree, one differs and one did not find it", w2 === "no two readers read it the same, VSS reads color ‘blue’ instead of color ‘red’; the Rules did not find this request", w2);
  const w3 = VT.agreementWords("SOP-BERT", R("command:move", {}), [{ label: "the Rules", agree: 0, reading: null }, { label: "VSS", agree: 0, reading: null }], N);
  const w4 = VT.agreementWords("SOP-BERT", R("command:move", {}), [{ label: "the Rules", agree: 1, reading: R("command:move", {}) }, { label: "VSS", agree: 1, reading: R("command:move", {}) }], N);
  const w5 = VT.agreementWords("VSS", R("command:align", { target: "start" }), [{ label: "SOP-BERT", agree: 0, reading: R("command:distribute", { target: "start" }) }, { label: "the Rules", agree: 1, reading: R("command:align", { target: "start" }) }], N);
  const w6 = VT.agreementWords("SOP-BERT", R("command:arrange", { action: "arrange", target: "check,done,start" }), [{ label: "VSS", agree: 0, reading: R("command:arrange", { action: "arrange" }) }, { label: "the Rules", agree: 0, reading: R("command:arrange", { action: "arrange", target: "mention(quantifier=all)" }) }], N.concat("Title"));
  check("agreementWords: the other two agree with each other, not with this reader", w6 === "VSS and the Rules both read target ‘every shape’ instead of target ‘check, done, start’", w6);
  // a reader with no reading of the same act over the same words: what it read there instead (otherAct), not "did not find this request"
  { const text = "label the arrow from Start to Check ok", mine = { pa: "command:connect", got: { action: "connect", from: "start", to: "check", label: "ok" }, span: [0, 38] };
    const rules = [{ pa: "command:label", got: { action: "label", from: "start", to: "check", label: "ok" }, span: [0, 38] }, { pa: "command:delete", got: { action: "delete" }, span: [40, 45] }];
    const o = VT.otherAct(text, rules, mine), w = VT.agreementWords("SOP-BERT", mine, [{ label: "the Rules", agree: 0, reading: o }, { label: "VSS", agree: 1, reading: mine }], N);
    check("otherAct: the Rules' reading of another act over the same words is said (not \"did not find\")", o === rules[0] && w === "VSS and SOP-BERT agree, the Rules read it as ‘label’ instead of ‘connect’" && VT.otherAct(text, rules.slice(1), mine) === null, w); }
  check("agreementWords: only one found it / all three agree / another action", w3 === "only SOP-BERT found this request" && w4 === "all three readers read it the same" && w5 === "the Rules and VSS agree, SOP-BERT reads it as ‘distribute’ instead of ‘align’", JSON.stringify([w3, w4, w5]));
  // the reader's own reasons under the column's weights: the sentence code of vss-confidence.js / neural-confidence.js on ownSpec
  const NCm = await import(pathToFileURL(path.join(ROOT, "docs/js/neural-confidence.js")).href);
  const sv = VT.ownSpec(MODEL.columns.vss.model), ss = VT.ownSpec(MODEL.columns.sop.model);
  const noVote = (spec) => spec.features.every((f) => !VT.VOTE_INPUTS.has(f.name));
  let okV = 0, okS = 0, nV = 0, nS = 0;
  for (const m of FX.messages.slice(0, 20)) {
    for (const v of m.vss.vss) { nV++; const r = VC.reasons(sv, { signals: v.f, world: v.world, notUnderstood: [], gaps: [] }); if (r.every((x) => typeof x.text === "string" && !/_/.test(x.text))) okV++; }
    for (const s of m.bert.sop) { nS++; const d = { act: s.act, second: "move", src: "", low: {}, unkW: [], splitW: [], stray: [] }; const r = NCm.reasons(ss, { f: s.f, act: s.act, detail: d }); if (r.every((x) => typeof x.text === "string" && !/_/.test(x.text))) okS++; }
  }
  check(`ownSpec: the own signals only (no vote inputs), and their reasons are sentences (VSS ${okV}/${nV}, SOP-BERT ${okS}/${nS})`, noVote(sv) && noVote(ss) && okV === nV && okS === nS && sv.features.length === 13 && ss.features.length === 24);
}
console.log(fails ? `\n${fails} failed` : "\nall passed");
process.exit(fails ? 1 : 0);
