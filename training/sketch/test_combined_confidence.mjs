// test_combined_confidence.mjs: parity of the browser code of the combined reader (docs/js/combined-confidence.js: pairing, agreement,
// confidence, decisions) with the script that fitted it (training/sketch/combine/combined_report.mjs), on the requests of the fixture
// training/sketch/combine/combined_parity.json (written by the script with EXPORT=1: per cut, the first test-part messages of fresh2 up to 200
// combined requests, the inputs as the browser has them and the script's confidence of every combined request).
//   node training/sketch/test_combined_confidence.mjs [combined.json] [fixture]
// Checks per cut: the same combined requests (which SOP-BERT request is paired with which VSS request, the VSS requests nothing was paired
// with), the same agree / agree_share / other_conf, max |confidence difference| ~ 0, and the execute / ask decision at the file's threshold
// the same for every request. other_conf is computed here as in the page: docs/js/vss-confidence.js confidence with docs/model/confidence/vss.json.
// Also: the threshold of each cut in the file equals the fixture's; bertEdges on a small hand-made example. Exit 0 when every check passes.
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, "../..");
const MODEL = JSON.parse(readFileSync(process.argv[2] || path.join(ROOT, "docs/model/confidence/combined.json"), "utf8"));
const FX = JSON.parse(readFileSync(process.argv[3] || path.join(HERE, "combine/combined_parity.json"), "utf8"));
const VSSJ = JSON.parse(readFileSync(path.join(ROOT, "docs/model/confidence/vss.json"), "utf8"));
const CC = await import(pathToFileURL(path.join(ROOT, "docs/js/combined-confidence.js")).href);
const VC = await import(pathToFileURL(path.join(ROOT, "docs/js/vss-confidence.js")).href);

let fails = 0;
const check = (name, ok, detail = "") => { console.log((ok ? "ok   " : "FAIL ") + name + (ok || !detail ? "" : "\n     " + detail)); if (!ok) fails++; };

for (const [cut, F] of Object.entries(FX.cuts)) {
  const t = CC.threshold(MODEL, cut, "cost");
  check(`${cut} cut: the file's threshold (${t}) = the fixture's`, t === F.threshold);
  let n = 0, maxd = 0, maxIn = 0, same = 0, sameSet = 0, msgs = 0;
  for (const m of F.messages) {
    const msg = { text: m.text, cut, sop: m.sop, vss: m.vss.map((v) => Object.assign({}, v, { conf: VC.confidence(VSSJ, v.f, v.world) })) };
    const r = CC.combine(MODEL, msg, "cost");
    const key = (x) => `${x.from}:${x.j}`, got = new Map(r.items.map((x) => [key(x), x]));
    const setOk = r.items.length === m.expect.length && m.expect.every((e) => got.has(key(e)));
    if (setOk) sameSet++;
    msgs++;
    for (const e of m.expect) {
      const x = got.get(key(e)); n++;
      if (!x) continue;
      maxd = Math.max(maxd, Math.abs(x.conf - e.conf));
      if (e.from === "sop") maxIn = Math.max(maxIn, Math.abs(x.agree - e.agree), Math.abs(x.agree_share - e.agree_share), Math.abs(x.other_conf - e.other_conf), x.partner === e.partner ? 0 : 1);
      if (x.execute === (e.conf >= F.threshold)) same++;
    }
  }
  check(`${cut} cut: the same combined requests on ${sameSet} of ${msgs} messages`, sameSet === msgs);
  check(`${cut} cut: the same pairs, agree, agree_share and other_conf (max difference ${maxIn.toExponential(2)})`, maxIn < 1e-12);
  check(`${cut} cut: max |confidence, browser code − script| = ${maxd.toExponential(2)} over ${n} requests`, n >= 200 && maxd < 1e-12);
  check(`${cut} cut: execute / ask decisions the same on ${same} of ${n} requests`, same === n);
  // the other levels of the file (cost5 "bolder", cost20 "more careful", all): the decision of every request = its confidence against that level's threshold
  for (const lv of CC.LEVELS.filter((l) => l !== "cost")) {
    const tl = CC.threshold(MODEL, cut, lv); let ok = 0, m = 0;
    for (const msg0 of F.messages) {
      const msg = { text: msg0.text, cut, sop: msg0.sop, vss: msg0.vss.map((v) => Object.assign({}, v, { conf: VC.confidence(VSSJ, v.f, v.world) })) }, r = CC.combine(MODEL, msg, lv);
      for (const e of msg0.expect) { const x = r.items.find((y) => y.from === e.from && y.j === e.j); m++; if (x && x.execute === (tl === -Infinity || e.conf >= tl)) ok++; }
    }
    const fileT = lv === "all" ? -Infinity : MODEL.cuts[cut].levels[lv].threshold;
    check(`${cut} cut, level ${lv} (threshold ${tl}): decisions the same on ${ok} of ${m} requests, threshold from the file`, ok === m && tl === fileT);
  }
}
// bertEdges: the cut head's edges at a unit (combine/collect_pair.mjs definitions)
{
  const W = [{ start: 0, end: 4, pB: 0.9, pI: 0.05 }, { start: 5, end: 6, pB: 0.1, pI: 0.8 }, { start: 7, end: 11, pB: 0.7, pI: 0.2 }, { start: 12, end: 15, pB: 0.05, pI: 0.9 }];
  const a = CC.bertEdges(W, 0, 6), b = CC.bertEdges(W, 7, 15), c = CC.bertEdges(null, 0, 6);
  check("bertEdges: start = P(B) of the first word, end = 1 − P(I) of the next word, 1 at the end, null without the cut head",
    a.cut_start === 0.9 && Math.abs(a.cut_end - 0.8) < 1e-15 && b.cut_start === 0.7 && b.cut_end === 1 && c.cut_start === null && c.cut_end === null, JSON.stringify([a, b, c]));
}
// the forms of 2026-11-02 (confidence3/NEW_FORMS_AUDIT.md): the agreement of VSS-BERT compares bench-canon.js canon values, which write the
// engine-true equivalences one way (help defaults, about=undefined, "every shape" of a whole-drawing operation, quantifier of a restyle)
{
  const BC = await import(pathToFileURL(path.join(ROOT, "docs/js/bench-canon.js")).href);
  const rd = (type, args, span) => { const w = { id: "w", type, args }; return { pa: `${type}:${args.action || args.ask || ""}`, got: BC.canon(w, [w]), span, args0: { action: args.action ?? null, name: null, count: null } }; };
  const text = "how do I add text? tidy up. make all arrows dashed";
  const S = [rd("question", { ask: "help", topic: "text", aspect: "how", about: undefined }, [0, 17]), rd("command", { action: "improve" }, [19, 26]), rd("command", { action: "set", kind: "edge", quantifier: "all", style: "dashed" }, [28, 50])];
  const V = [rd("question", { ask: "help", topic: "text", aspect: "how" }, [0, 17]), rd("command", { action: "improve", target: [] }, [19, 26]), rd("command", { action: "set", kind: "edge", style: "dashed" }, [28, 50])];
  const a = CC.agreement(text, S, V);
  check("new forms: help with about=undefined, improve with an empty target list, a restyle without quantifier pair and agree", a.every((x, i) => x.partner === i && x.agree === 1), JSON.stringify(a));
  const V2 = [rd("question", { ask: "help", topic: "delete", aspect: "how" }, [0, 17]), rd("command", { action: "improve", target: "Start" }, [19, 26]), rd("command", { action: "set", kind: "edge", style: "dotted" }, [28, 50])];
  const b = CC.agreement(text, S, V2);
  check("new forms: another help topic, one shape instead of the whole drawing, another style pair and disagree", b.every((x, i) => x.partner === i && x.agree === 0), JSON.stringify(b));
}
console.log(fails ? `\n${fails} failed` : "\nall passed");
process.exit(fails ? 1 : 0);
