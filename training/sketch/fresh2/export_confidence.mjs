// fresh2/export_confidence.mjs: turns the fits of fit_report.mjs (EXPORT=<dir>) into the demo's confidence files and checks them.
//   ARM=VSS-G EXPORT=<dir> node training/sketch/fresh2/fit_report.mjs <records dir> <report.md> <fresh2 data dirs>   (once per arm)
//   node training/sketch/fresh2/export_confidence.mjs --vss <dir>/vss_arm.json --bert <dir>/sop_arm_own.json [--arm-vss VSS-G] [--arm-bert BERT-G]
// Writes docs/model/confidence/vss.json (the format of the shipped file: readers.vss_combined with features, tables, world prior, levels)
// and docs/model/confidence/sop-bert.json (the format of training/sketch/precision_thresholds_bert.json), each with a "cost" level (the
// threshold that maximises the cost score, one confident mistake = 10 right answers, on the out-of-fold calibration confidences, exactly as
// fit_report.mjs reads it) as the default (operating_level "cost", threshold = the cost threshold), and the 95/97/99 levels (null when not
// reached with >= MINEXEC executed). Then checks, from the written files only: the confidence recomputed with the demo's code
// (docs/js/vss-confidence.js; precision_confidence_bert.mjs) on every produced request of the arm's records equals the fit's (max abs
// difference), the execute / ask decisions on the test part are the same, and the test part's cost score equals the fit's.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as VC from "../../../docs/js/vss-confidence.js";
import { bertConfidence } from "../precision_confidence_bert.mjs";

const REPO = new URL("../../../", import.meta.url).pathname;
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const VSSF = arg("--vss"), BERTF = arg("--bert"), ARMV = arg("--arm-vss", "VSS-G"), ARMB = arg("--arm-bert", "BERT-G");
if (!VSSF || !BERTF) { console.error("usage: export_confidence.mjs --vss <vss_arm.json> --bert <sop_arm_own.json>"); process.exit(2); }
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const STAGE = { cut_start: "cut", cut_end: "cut", world_gap: "world", world_rank: "world", wnu_gap: "world", tie: "world", role_min: "roles", residual: "roles",
  unplaced: "roles", abstain: "roles", notu_frac: "words", ctx_fill: "context", ctx_margin: "context", world_prior: "prior" };
const DATA = "the fresh2 calibration part (training/sketch/llm_bench/fresh2/opus_a..d, messages with int(sha256(id), 16) % 3 == 0)";

function bestReachable(oof, os, minexec) {   // the highest out-of-fold precision of a confidence-ordered prefix (block ends) with >= minexec executed
  const s = oof.map((c, i) => ({ c, o: os[i] })).sort((a, b) => b.c - a.c); let r = 0, best = null;
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; j++; } if (j >= minexec && (best == null || r / j > best)) best = r / j; i = j; }
  return best;
}
const level = (E, L, produced) => (L ? { threshold: L.t, heldout_oof_precision: L.prec, heldout_oof_coverage: L.cov, heldout_oof_asked: L.asked, heldout_oof_executed: L.n, heldout_produced: produced } : null);
function costLevel(E) {
  const c = E.costThreshold, t = c.t === "-Infinity" ? null : c.t === "Infinity" ? null : c.t;
  return { threshold: t, kind: c.kind, cost: E.cost, heldout_oof_score: c.calScore, heldout_oof_precision: c.calPrec, heldout_oof_coverage: c.calCov, heldout_oof_asked: c.calAsked,
    heldout_oof_executed: c.calExecuted, heldout_produced: E.calibration.produced,
    test_score: E.testAtCost.score, test_score_ci95: E.testAtCost.ci, test_confidently_wrong: E.testAtCost.conf_wrong, test_done_right: E.testAtCost.cov, test_asked: E.testAtCost.asked, test_executed: E.testAtCost.executed };
}

// ------------------------------------------------------------------ VSS
const EV = JSON.parse(readFileSync(VSSF, "utf8"));
if (EV.kind !== "vss") throw new Error(`${VSSF} is not a VSS fit`);
const calV = EV.items.filter((x) => x.cal), produced = EV.calibration.produced;
const vssSpec = {
  confidence: `logistic over 14 named stage signals, each a percentile of its distribution on the calibration part (see features, tables); the recipe 'logistic all minus event' of VSS_CONFIDENCE.md (the event stage left out), refitted for arm ${ARMV} by training/sketch/fresh2/fit_report.mjs. Reference implementation: training/sketch/precision_confidence.mjs. Execute when confidence >= threshold.`,
  l2: EV.lam, intercept: EV.w[0],
  features: EV.names.map(([n], j) => ({ name: n, stage: STAGE[n], weight: EV.w[j + 1] })),
  tables: EV.tables, world_prior: EV.prior, world_prior_default: EV.overall,
  how_to: "z = intercept + sum(weight_i * percentile_i); confidence = 1/(1+exp(-z)). percentile_i: x = raw signal (world_prior: the table value of the chosen world, else world_prior_default; world 'none' when no world); null/undefined -> 1; binary table -> (sign>0 ? x>0 : x<0.5) ? 1 : 0; else y = x*sign, lo = count of table values < y, eq = count equal to y, percentile = (lo + eq/2)/n. tables[name]: n, sign, binary, values (sorted distinct oriented calibration values), below (number of calibration values strictly below each distinct value).",
  levels: { cost: costLevel(EV), 95: level(EV, EV.thr[95], produced), 97: level(EV, EV.thr[97], produced), 99: level(EV, EV.thr[99], produced) },
  threshold: costLevel(EV).threshold,
  threshold_source: `out-of-fold: each calibration request scored by the model of the 5-fold cross-validation (folds by message) that did not see its fold; L2 ${EV.lam} chosen from {0.01, 0.1, 1, 10} by out-of-fold AUROC (${EV.oofAuc.toFixed(3)}); the weights, intercept, tables and world prior are the final fit on all of the calibration part (${produced} produced requests). The "cost" level: the threshold that maximises the cost score (requests done right - ${EV.cost} x (executed wrong + extras executed)) / requested actions x 100 on the out-of-fold confidences (a tie keeps the higher threshold); test part: score ${EV.testAtCost.score.toFixed(1)} [${EV.testAtCost.ci.map((x) => x.toFixed(1)).join(", ")}] (FEEDBACK_RESULT.md, fresh2/VERDICTS.md).`,
  levels_note: `levels.cost is the default (the owner's decision 2026-11-02 21:24: execute only what it is sure of, at the cost-score threshold). levels[95|97|99] = null: no threshold reaches that precision of execution on the calibration part's out-of-fold confidences with at least ${EV.minexec} executed; the demo shows the level as not reachable. heldout_* fields: the calibration part (the name is kept from the earlier file); heldout_oof_*: out-of-fold precision / right share / asked share at the threshold; test_*: the test part of fresh2 at the cost threshold (reported, never used to choose).`,
  best_reachable_heldout_oof_precision: bestReachable(EV.oof, calV.map((x) => x.o), EV.minexec),
};
const vssFile = {
  about: `VSS combined confidence and its thresholds for the demo (docs/js/vss-confidence.js), for the VSS worlds of arm ${ARMV} (FEEDBACK_PLAN.md, FEEDBACK_RESULT.md). Weights, intercept, percentile tables, world prior and thresholds: fitted on ${DATA} by training/sketch/fresh2/fit_report.mjs (EXPORT) from the arm's records (${EV.records.replace(/^.*?results\//, "gpu-runs:results/")}), written by training/sketch/fresh2/export_confidence.mjs. A refit replaces this file only (no code change) and training/sketch/stamp_models.py gives it a new version.`,
  protocol: `FRESH2_PLAN.md / FEEDBACK_PLAN.md: confidences fitted on the fresh2 calibration part only (${EV.calibration.messages} messages, ${EV.calibration.requested} requested actions); the default level "cost" is the threshold that maximises the cost score (one confident mistake = ${EV.cost} right answers, AGENTS.md) on the out-of-fold calibration confidences; the 95/97/99 levels are the lowest threshold whose out-of-fold precision of execution is >= the level with >= ${EV.minexec} executed. The test part (${EV.test.messages} messages, ${EV.test.requested} requested actions) is only scored.`,
  operating_level: "cost",
  heldout: { messages: EV.calibration.messages, requested: EV.calibration.requested, produced },
  readers: { vss_combined: vssSpec },
};
writeFileSync(`${REPO}docs/model/confidence/vss.json`, JSON.stringify(vssFile, null, 1) + "\n");

// ------------------------------------------------------------------ SOP-BERT
const EB = JSON.parse(readFileSync(BERTF, "utf8"));
if (EB.kind !== "sop") throw new Error(`${BERTF} is not a SOP-BERT fit`);
const lvB = (L) => (L ? { threshold: L.t, heldout_precision: L.prec, heldout_coverage: L.cov, heldout_asked: L.asked, heldout_executed: L.n, heldout_produced: EB.calibration.produced } : null);
const cB = costLevel(EB);
const bertFile = {
  about: `SOP-BERT fitted confidence and its thresholds for the demo, for the model of arm ${ARMB} (docs/model/neural/sop-bert; FEEDBACK_PLAN.md, FEEDBACK_RESULT.md). Fitted on ${DATA} by training/sketch/fresh2/fit_report.mjs (EXPORT) from the arm's records (${EB.records.replace(/^.*?results\//, "gpu-runs:results/")}), written by training/sketch/fresh2/export_confidence.mjs. Same format as training/sketch/precision_thresholds_bert.json, plus the "cost" level.`,
  protocol: `FRESH2_PLAN.md / FEEDBACK_PLAN.md: the logistic over the 24 signals, percentile maps, act prior and L2 fitted on the fresh2 calibration part only (${EB.calibration.messages} messages, ${EB.calibration.requested} requested actions, ${EB.calibration.produced} produced requests), 5 folds by message, L2 from {0.01, 0.1, 1, 10} by out-of-fold AUROC; the default level "cost" is the threshold that maximises the cost score (one confident mistake = ${EB.cost} right answers, AGENTS.md) on the out-of-fold calibration confidences (a tie keeps the higher threshold); 95/97/99: the lowest threshold whose out-of-fold precision of execution is >= the level with >= ${EB.minexec} executed. The final model (refit on all of the calibration part) is applied unchanged elsewhere. Test part (${EB.test.messages} messages, ${EB.test.requested} requested actions) at the cost threshold: score ${EB.testAtCost.score.toFixed(1)} [${EB.testAtCost.ci.map((x) => x.toFixed(1)).join(", ")}].`,
  winner: "c1: logistic, all signals",
  operating_level: "cost",
  heldout: { messages: EB.calibration.messages, requested: EB.calibration.requested, produced: EB.calibration.produced },
  levels_out_of_fold: { cost: cB, 95: lvB(EB.thr[95]), 97: lvB(EB.thr[97]), 99: lvB(EB.thr[99]) },
  levels_note: `levels_out_of_fold.cost is the default (the owner's decision 2026-11-02 21:24). A level that is null is not reached on the calibration part with at least ${EB.minexec} executed. heldout_* = the fresh2 calibration part (names kept from precision_thresholds_bert.json); test_* = the fresh2 test part at the cost threshold (reported, never used to choose). No levels_in_sample: fit_report.mjs reads every threshold from out-of-fold confidences.`,
  how_to: "Execute a request when confidence >= threshold (the default: levels_out_of_fold.cost.threshold = threshold). confidence = bertConfidence(spec, f, act) of training/sketch/precision_confidence_bert.mjs (z = intercept + sum(weight_i * percentile_i), 1/(1+exp(-z)); percentile as described in that file: null/undefined signal -> 1; act_prior: act_prior[act], else act_prior_default; the signals f come from precision_bert_collect.mjs `features`).",
  rule: "logistic", l2: EB.lam, oof_auroc: EB.oofAuc, intercept: EB.w[0],
  features: EB.names.map(([n], j) => ({ name: n, weight: EB.w[j + 1] })),
  tables: EB.tables, act_prior: EB.prior, act_prior_default: EB.overall,
  threshold: cB.threshold,
};
writeFileSync(`${REPO}docs/model/confidence/sop-bert.json`, JSON.stringify(bertFile, null, 1) + "\n");
console.log("wrote docs/model/confidence/vss.json and docs/model/confidence/sop-bert.json");

// ------------------------------------------------------------------ checks, from the written files only
function check(label, E, confOf, t, prodOf) {
  const recs = readJ(E.records), items = [];
  recs.forEach((r, k) => { for (const x of prodOf(r)) items.push({ k, r, x }); });
  if (items.length !== E.items.length) throw new Error(`${label}: ${items.length} produced requests in the records, ${E.items.length} in the fit`);
  let maxd = 0, sameDec = 0, nTest = 0, r = 0, bad = 0;
  const tFit = E.costThreshold.t === "-Infinity" ? -Infinity : E.costThreshold.t === "Infinity" ? Infinity : E.costThreshold.t;
  items.forEach(({ k, r: rec, x }, i) => {
    const e = E.items[i]; if (e.id !== rec.id || e.k !== k) throw new Error(`${label}: item ${i} order differs`);
    const c = confOf(x); maxd = Math.max(maxd, Math.abs(c - e.c));
    if (!e.cal) { nTest++; if ((c >= t) === (e.c >= tFit)) sameDec++; if (c >= t) { if (x.o === "right") r++; else bad++; } }
  });
  const Gt = recs.filter((rec) => !isCalId(E, rec.id)).reduce((a, rec) => a + rec.gold, 0);
  const score = ((r - E.cost * bad) / Gt) * 100;
  console.log(`${label}: max |confidence from the JSON - fit's confidence| = ${maxd.toExponential(2)} over ${items.length} produced requests; test-part decisions the same ${sameDec}/${nTest}; test cost score ${score.toFixed(2)} (fit ${E.testAtCost.score.toFixed(2)}; executed ${r + bad}, right ${r}, wrong+extras ${bad}, requested ${Gt})`);
  return { maxd, sameDec, nTest, score };
}
// the calibration split of a message: the fit's own flag (every produced request of a message carries it); a message with no produced
// request is split by the same hash as fit_report.mjs
function isCalId(E, id) { const it = E.items.find((x) => x.id === id); return it ? it.cal : BigInt("0x" + createHash("sha256").update(id).digest("hex")) % 3n === 0n; }

const vModel = JSON.parse(readFileSync(`${REPO}docs/model/confidence/vss.json`, "utf8")), bModel = JSON.parse(readFileSync(`${REPO}docs/model/confidence/sop-bert.json`, "utf8"));
const tV = VC.threshold(vModel, VC.DEFAULT_LEVEL);
if (VC.DEFAULT_LEVEL !== "cost") console.log(`note: docs/js/vss-confidence.js DEFAULT_LEVEL is ${VC.DEFAULT_LEVEL}, not "cost"; the check below uses levels.cost`);
const cv = check(`VSS ${ARMV} (docs/js/vss-confidence.js confidence)`, EV, (x) => VC.confidence(vModel, x.f, x.w), VC.DEFAULT_LEVEL === "cost" ? tV : vModel.readers.vss_combined.levels.cost.threshold, (r) => r.vss);
const cb = check(`SOP-BERT ${ARMB} (precision_confidence_bert.mjs bertConfidence)`, EB, (x) => bertConfidence(bModel, x.f, x.act), bModel.threshold, (r) => r.sop);
const ok = cv.maxd < 1e-12 && cb.maxd < 1e-12 && cv.sameDec === cv.nTest && cb.sameDec === cb.nTest && Math.abs(cv.score - EV.testAtCost.score) < 1e-9 && Math.abs(cb.score - EB.testAtCost.score) < 1e-9;
console.log(ok ? "CHECK OK" : "CHECK FAILED"); if (!ok) process.exit(1);
