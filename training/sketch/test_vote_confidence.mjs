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
