// confidence3/export3.mjs: EXPORT=1 of fit3.mjs. Writes docs/model/confidence/vote3.json (the chosen confidence of the columns VSS, SOP-BERT
// and 3-vote of confidence3/PLAN.md, plus the weight-free 3/3 vote) and the parity fixture training/sketch/confidence3/vote3_parity.json
// (inputs as the page has them and the script's confidences, for training/sketch/test_vote_confidence.mjs). Does not touch vss.json,
// sop-bert.json or combined.json.
import { writeFileSync } from "node:fs";

const NPARITY = 60;   // test-part messages in the fixture
export function exportVote({ REPO, CHOSEN, VERD, M, ROW, BUILT, scoreOf, KIND, demoF }) {
  const part = (m) => ({
    kind: m.kind, l2: m.lam, intercept: m.w[0], features: m.names.map(([n], j) => ({ name: n, weight: m.w[j + 1] })),
    tables: m.tables, prior_name: KIND[m.kind].prior, prior: m.prior, prior_default: m.overall,
    prior_used: m.names.some(([n]) => n === KIND[m.kind].prior)
  });
  const lv = (T) => Object.fromEntries(Object.entries(T).map(([k, v]) => [k, Number.isFinite(v) ? v : v === -Infinity ? "executes everything" : "asks everything"]));
  const col = (r) => {
    const o = { variant: r.name, agreement: r.mk.mode === "engine" ? "engine" : "canon", per_type: r.perType,
      levels: { cost5: lv(r.T[5]), cost: lv(r.T[10]), cost20: lv(r.T[20]) },
      calibration_oof: { score: scoreOf(r.calSt), done_right: r.calSt.cov, confidently_wrong: r.calSt.conf_wrong, executed: r.calSt.n },
      test: { score: scoreOf(r.testSt), done_right: r.testSt.cov, confidently_wrong: r.testSt.conf_wrong, executed: r.testSt.n },
      short_commands: Object.fromEntries(Object.entries(r.shSt || {}).map(([k, st]) => [k, { score: scoreOf(st), done_right: st.cov, confidently_wrong: st.conf_wrong, executed: st.n }])) };
    if (r.mk.kind === "one") o.model = part(r.F.fit.model);
    else if (r.mk.kind === "two") o.parts = { sop: part(r.F.fitS.model), vss: part(r.F.fitV.model) };
    else o.rule = "execute when n_agree >= the level's threshold";
    return o;
  };
  const vt = CHOSEN["3-vote"], vtRule = { ...vt };
  const file = {
    about: "The confidence of three readers voting (training/sketch/confidence3/PLAN.md, RESULT.md): Rules, VSS and SOP-BERT read the same cut; their requests are paired (pairValue, as combined.json) and two readings agree when every canonical value is equal (agreement 'engine': arrange / distribute targets compared as sets, and 'no target' = unfiltered mention(quantifier=all) = every canvas name). Columns: 'vss' (VSS alone: its 14 signals + whether SOP-BERT and the Rules on the same units agree), 'sop' (SOP-BERT alone, BERT cut: its 24 signals + whether VSS and the Rules agree), 'vote3' (the three readers on the BERT cut: SOP-BERT's reading of a request unless only VSS and the Rules agree, then VSS's; two logistic parts), 'vote3_rule' (no weights: execute when all three agree). Fitted on the fresh2 calibration part out of fold by training/sketch/confidence3/fit3.mjs (EXPORT=1); browser code docs/js/vote-confidence.js (training/sketch/test_vote_confidence.mjs checks it). Prepared, not wired into the page.",
    partner: { file: "confidence/vss.json", note: "other_conf of the vote3 sop part is vss.json's confidence of the paired VSS request (VSS cutter signals); refit both together" },
    inputs: { rules_clean: "the paired Rules request has no note about it and the Rules' result has no message-level note and no not-understood piece", rules_notes: "message-level notes + not-understood pieces + notes about the paired Rules request" },
    cost: 10, levels: ["cost5", "cost", "cost20"], default_level: "cost",
    verdicts_test: VERD,
    columns: { vss: col(CHOSEN.VSS), sop: col(CHOSEN["SOP-BERT"]), vote3: col(vt) },
    vote3_rule: { agreement: "engine", levels: { cost5: { all: 3 }, cost: { all: 3 }, cost20: { all: 3 } }, note: "3/3 agree; no fitted weights" }
  };
  writeFileSync(`${REPO}docs/model/confidence/vote3.json`, JSON.stringify(file) + "\n");

  // ---------------- the parity fixture: the first NPARITY test-part messages with any request
  const I = M.I;
  const SOPF = ["act_p", "act_margin", "act_negent", "val_p_min", "val_margin_min", "none_p_min", "fill_p_min", "fill_margin_min", "ctx_fill", "tag_p_min", "tag_margin_min", "tag_all_min", "tag_stray", "desc_p_min", "desc_margin_min", "cut_start", "cut_end", "cut_inner_min", "unk_share", "split_share", "n_words", "n_roles", "n_units"];
  const VSSF = ["cut_start", "cut_end", "world_gap", "world_rank", "wnu_gap", "tie", "role_min", "residual", "unplaced", "abstain", "notu_frac", "ctx_fill", "ctx_margin"];
  const pick = (f, ks) => Object.fromEntries(ks.map((k) => [k, f[k] ?? null]));
  const reading = (x) => ({ pa: x.pa, got: x.got, span: x.span, args0: x.args0 });
  const msgs = [];
  for (const id of M.ids) {
    if (msgs.length >= NPARITY) break;
    const rowOf = (k) => I[k].filter((x) => x.id === id);
    const S = rowOf("sop_own"), VB = rowOf("vss_bert"), RB = rowOf("rules_bert"), VO = rowOf("vss_own"), SV = rowOf("sop_vss"), RV = rowOf("rules_vss");
    if (!S[0] || !S[0].test) continue;
    const exp = {};
    for (const [key, colName, cands] of [["vss", "VSS", "V"], ["sop", "SOP-BERT", "P"], ["vote3", "3-vote", "VT"]]) {
      const r = CHOSEN[colName], C = BUILT[r.mk.mode || "canon"].M[cands].filter((x) => x.id === id);
      if (r.F.setOther) r.F.setOther(-1);
      exp[key] = C.map((x) => ({ from: x.from, j: x.j, conf: r.F.conf(x), n: x.n ?? x.f.n_agree }));
    }
    { const C = BUILT.engine.M.VT.filter((x) => x.id === id); exp.vote3_rule = C.map((x) => ({ from: x.from, j: x.j, n: x.n })); }
    const rb = M.RM.rules_bert.get(id), rv = M.RM.rules_vss.get(id);
    msgs.push({ id, text: ROW.get(id).text, names: ROW.get(id).names || [],
      bert: { sop: S.map((x) => ({ ...reading(x), f: pick(x.f, SOPF), act: x.act })), vss: VB.map((x) => ({ ...reading(x), f: pick(demoF(x), VSSF), world: x.w, bert_edges: { cut_start: x.f.cut_start ?? null, cut_end: x.f.cut_end ?? null } })),
        rules: RB.map((x) => ({ ...reading(x), notes: x.notes })), rulesMsg: { msgNotes: rb.msgNotes, unread: rb.unread } },
      vss: { vss: VO.map((x) => ({ ...reading(x), f: pick(x.f, VSSF), world: x.w })), sop: SV.map(reading), rules: RV.map((x) => ({ ...reading(x), notes: x.notes })), rulesMsg: { msgNotes: rv.msgNotes, unread: rv.unread } },
      expect: exp });
  }
  writeFileSync(new URL("./vote3_parity.json", import.meta.url), JSON.stringify({ about: "Inputs and the script's confidences for training/sketch/test_vote_confidence.mjs (written by confidence3/fit3.mjs EXPORT=1).", messages: msgs }) + "\n");
  console.error(`EXPORT: wrote docs/model/confidence/vote3.json and training/sketch/confidence3/vote3_parity.json (${msgs.length} messages)`);
}
