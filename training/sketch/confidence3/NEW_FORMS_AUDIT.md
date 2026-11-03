# NEW_FORMS_AUDIT: do the parts that combine and measure the readers treat the forms of 2026-11-02 right? (2026-11-03)

Question (before job 072 of TRAIN_PLAN_1103.md): job 072 measures the retrained VSS and SOP-BERT and refits every confidence file
(confidence3/refit.sh: vss.json, sop-bert.json, combined.json, vote3.json). Are the pairing, the agreement, the scorer, the confidence features
and the demo's gates right for the new forms (help questions, templates, free text, the layout operations, arrow restyle / reverse / labels,
create with layout / outline / at / linked, undo count, group / ungroup)?

Short answer: the pairing is right; the agreement and the scorer were wrong on most new forms where two forms do the same thing in
docs/js/logic.js (3634 false disagreements and 740 false "wrong" among 18716 checked variants), and the scorer counted 1729 readings "right"
that the engine executes differently. Fixed in docs/js/bench-canon.js and docs/js/vote-confidence.js (now 211 / 721 / 1310, see section 2 for
what is left and why). refit.sh runs with the new acts and worlds and drops nothing. 072 must run on code that has these fixes.

Everything below was measured with the models of HEAD (docs/model/micro, docs/model/neural/sop-bert) and logic.js of HEAD.

## 1. How it was checked

`training/sketch/confidence3/audit_new_forms.mjs` (new; ~40 s, CPU). For every request of llm_bench/short3 (513 messages without a pending wire),
llm_train/opus_ext_1, synth_rules_ext and ops_formulations (4496 messages, 5784 requests, 4193 of them new forms):

1. **gold vs gold**: each gold wire is turned into SOP nodes (a mention becomes a mention wire, `$new` a reference to the last wire that made
   shapes), read by `canon` and compared with `canonWant` of the same gold; two copies of the message's requests go through
   combined-confidence.js `agreement` (VSS-BERT) and vote-confidence.js `agreementOf` (canon and engine mode).
2. **variants**: for every new-form request, 51 kinds of variants (target order, "every shape" written three ways, items order and form, help
   keys, label "" / null, arrow ends swapped, quantifier, pairing, one value changed, one key dropped or added). Each variant is read as one
   reader's reading against the gold as the other's. The verdict of the agreement and of the scorer (the collectors' "right": every gold key
   equal) is compared with **what the engine does**: the message runs in logic.js on two drawings (the message's names as shapes with arrows
   between neighbours one way; the same with arrows both ways, the forward ones labelled, dotted and red, and a group), once with the gold and
   once with the variant in place of that request. The engine does the same thing when both drawings end identical and every step gives the
   same value, answer and error.

A false agreement: the readings agree but the engine does different things. A false disagreement: they disagree but it does the same thing.
Likewise false right / false wrong for the scorer.

## 2. Results

### Gold vs gold

| folder | messages | requests | new forms | canon ≠ canonWant | unpaired | disagree (VSS-BERT / vote canon / vote engine) |
|---|---|---|---|---|---|---|
| llm_bench/short3 | 513 | 644 | 188 | 0 | 0 | 0 / 0 / 0 |
| llm_train/opus_ext_1 | 500 | 743 | 629 | 0 | 0 | 0 / 0 / 0 |
| llm_train/synth_rules_ext | 2783 | 3664 | 2808 | 0 | 0 | 0 / 0 / 0 |
| llm_train/ops_formulations | 700 | 733 | 568 | 0 | 0 | 0 / 0 / 0 |

Every request pairs and agrees with itself, before and after the fixes; canon and canonWant write every new key the same way (items, items2,
parents as a list or one string, title, about, topic, aspect, template, scheme, kind, at, outline, linked, label "").

### Variants: before -> after the fixes

In all 18716 variants. Vote (engine mode, as the demo and fit3 use it): false agreements **205 -> 3**, false disagreements **3634 -> 211**.
VSS-BERT (combined-confidence.js, canon values): false agreements 0 -> 1, false disagreements **3987 -> 1030**. Scorer: false right
**1729 -> 1310**, false wrong **740 -> 721** (the remaining ones are explained below the table). Rows with any false verdict ("a -> b" =
before -> after; one number = unchanged):

| form / variant | n | engine does the same | vote: false agree | vote: false disagree | VSS-BERT: false agree / disagree | scorer: false right | scorer: false wrong |
|---|---|---|---|---|---|---|---|
| arrow label / from,to swapped | 80 | 8 | 0 | 8 | 0 / 8 | 0 | 8 |
| arrow label / target absent -> every name | 81 | 81 | 0 | 81 -> 0 | 0 / 81 -> 1 | 0 | 0 -> 1 |
| arrow label / target absent -> mention(quantifier=all) | 81 | 81 | 0 | 81 -> 0 | 0 / 81 -> 0 | 0 | 0 |
| arrow label / target absent -> one name | 81 | 80 | 0 | 80 -> 0 | 0 / 80 -> 0 | 1 -> 0 | 0 |
| arrow restyle / quantifier=all added | 49 | 49 | 0 | 49 -> 0 | 0 / 49 -> 0 | 0 | 0 |
| arrow restyle / quantifier=all dropped | 25 | 25 | 0 | 25 -> 0 | 0 / 25 -> 0 | 0 | 25 -> 0 |
| arrow restyle / target absent -> every name | 151 | 151 | 0 | 151 -> 0 | 0 / 151 -> 44 | 0 | 0 -> 44 |
| arrow restyle / target absent -> mention(quantifier=all) | 151 | 151 | 0 | 151 -> 0 | 0 / 151 -> 0 | 0 | 0 |
| arrow restyle / target absent -> one name | 151 | 107 | 0 | 107 -> 0 | 0 / 107 -> 0 | 44 -> 0 | 0 |
| help / about added beside a topic | 627 | 627 | 0 | 627 -> 0 | 0 / 627 -> 0 | 0 | 0 |
| help / about dropped | 152 | 9 | 0 | 9 -> 0 | 0 / 9 -> 0 | 0 | 9 -> 0 |
| help / about: undefined | 885 | 742 | 0 | 742 -> 0 | 0 / 742 -> 0 | 0 | 9 -> 0 |
| help / aspect absent -> overview | 106 | 106 | 0 | 106 -> 0 | 0 / 106 -> 0 | 0 | 0 |
| help / aspect overview -> absent | 115 | 115 | 0 | 115 -> 0 | 0 / 115 -> 0 | 0 | 115 -> 0 |
| help / topic absent -> general | 249 | 249 | 0 | 249 -> 0 | 0 / 249 -> 0 | 0 | 0 |
| layout op / target absent -> every name | 382 | 381 | 0 -> 1 | 246 -> 0 | 0 / 381 | 1 -> 0 | 0 -> 227 |
| layout op / target absent -> mention(quantifier=all) | 382 | 382 | 0 | 247 -> 0 | 0 / 382 -> 154 | 0 | 0 |
| layout op / target absent -> one name | 382 | 34 | 0 | 34 | 0 / 34 | 348 -> 154 | 0 -> 34 |
| layout op / target added (one name) | 233 | 34 | 0 | 34 | 0 / 34 | 199 -> 19 | 0 -> 34 |
| layout op / target all -> absent | 190 | 189 | 0 -> 1 | 155 -> 0 | 0 -> 1 / 189 -> 44 | 0 -> 1 | 189 -> 44 |
| layout op / target all -> every name | 188 | 187 | 1 | 154 -> 0 | 0 / 187 | 0 | 187 |
| layout op / target order reversed | 37 | 37 | 0 | 30 -> 0 | 0 / 37 -> 8 | 0 | 37 -> 8 |
| pairing / pairing chain dropped | 23 | 23 | 0 | 23 -> 1 | 0 / 23 -> 1 | 0 | 23 -> 1 |
| pairing / pairing next dropped | 5 | 5 | 0 | 5 -> 0 | 0 / 5 -> 0 | 0 | 5 -> 0 |
| template (arrange) / target order reversed | 199 | 3 | 196 -> 0 | 0 -> 3 | 0 / 3 | 0 | 3 |
| template (arrange) / target all -> absent | 6 | 0 | 6 -> 0 | 0 | 0 / 0 | 0 | 0 |
| template (arrange) / target all -> every name | 6 | 6 | 0 | 0 -> 6 | 0 / 6 | 0 | 6 |
| template / title added | 1134 | 0 | 0 | 0 | 0 / 0 | 1134 | 0 |
| template / count dropped | 222 | 52 | 0 | 52 | 0 / 52 | 0 | 52 |
| template / scheme changed | 228 | 20 | 0 | 20 | 0 / 20 | 0 | 20 |
| template / last item dropped | 1181 | 10 | 0 | 10 | 0 / 10 | 0 | 10 |

("layout op" here is the ten operations, align with a direction, and arrange with layout tree / layers / radial / organic; "template" includes
`arrange template=`.) Rows not listed: no false verdict before or after, among them: items order reversed (1181, the engine always differs:
item i gets place i and colour i), items as a list vs one string (1181, agree), label "" -> null (12, the engine differs: null asks what the
label should say), template changed / dropped, topic changed / dropped, aspect changed (all disagree, the engine differs).

### The false agreements (before)

- **arrange with a template, target in another order (196)**: engineNorm treated `arrange` as order-free; `arrange template=timeline
  target=A,B,C` places the shapes in the order given (logic.js arrange with a template, templates.js item i). Fixed: listFree excludes arrange
  with a template.
- **arrange with a template, target all vs absent (6)**: same cause, same fix.
- **arrange layout=tree, "every shape" vs the list of every name (1)**: the tree of shapes without links falls back to the hierarchy form "in
  the order given". Left (one case; arrange stays order-free for agreement without a template).

After the fixes 3 remain, none of them a real one: oe1-0336 (the arrange case above); ops-0717 "delete Cache and tidy up" (the list of the
message's names still holds Cache, deleted by the request before: "every canvas name" is taken from the names at the start of the message,
as fit3 and the page do); se-02442 on an empty canvas (both readings fail; only the error message differs).

### The false disagreements (before), by cause

| cause | variants | where logic.js shows it is the same request |
|---|---|---|
| help `about=undefined` read as the value "?" | 742 | canon wrote a key with an undefined / null value as "?"; logic.js reads `a.k != null`. Also an empty list was written "" |
| help `about` beside a topic | 627 | help-answers.js answer(): `about` is read only without a topic (or for a topic with no sense in the legend) |
| help topic=general vs no topic | 249 | answer(): `!topic \|\| topic === 'general'` is one branch |
| help aspect=overview vs no aspect | 221 | answer(): overview is the default aspect |
| layout operations, "every shape" written two or three ways, and target order | 682 | logic.js alRun: no target and mention(quantifier=all) are the same `whole` set; auto-layout.js context() takes the targets as a Set (canvas / reading order; equalize, distribute, sort sort them themselves). engineNorm knew this only for arrange and distribute |
| arrow restyle / reverse, quantifier and "every arrow" | 483 | restyleEdges / edgesOf never read quantifier; with from / to the target is not read; without them no target = every arrow |
| arrow label by its ends, a target added; label kind=edge quantifier=all, target | 242 | labelEdge: by its ends target and quantifier are not read; kind=edge with quantifier=all, no target = every arrow |
| connect a list, pairing chain / next vs none | 28 | logic.js connect: `a.pairing \|\| (!to.length && from.length > 1)` -> a chain unless pairing=all |

### What is left, and why

- **from / to swapped (restyle 1, label 8 engine-same; 99 + 80 checked)**: logic.js edgesNamed tries the stated direction first and the other
  only when it finds no arrow, so swapped ends are the same arrow only on a drawing with one direction. Kept as a disagreement and as "wrong"
  (the engine-same cases are drawings where neither direction has an arrow and both fail the same way).
- **a target list of every canvas name for a whole-drawing operation (scorer: 227 + 187 + 44 false wrong)**: the scorer has no canvas names
  (canon / canonWant see one wire), so "every name" is compared with mention(quantifier=all) as a list. It errs on the side of "wrong" (a reader
  is penalised, never silently credited). The vote (engineNorm with the names) agrees with it.
- **arrange (not a new form)**: gold "no target" with a reading that names shapes still scores right (154 + 19 false right), "every shape"
  written two ways still scores wrong (44): arrange was left out of the "no target = every shape" rule and of ORDER_FREE, because arrange with a
  template, and a tree / radial of unlinked shapes, read the order given and need a target. A decision for the owner: whether arrange without a
  template gets the same rule as the other whole-drawing operations (it would change the regress numbers of arrange).
- **keys only the reading has are not scored (template / title added: 1134 false right)**: the collectors' scorer (and llm_score tally) counts a
  reading right when every gold key is equal; a key the gold does not have is ignored. A reading that adds a title, a colour or a target that
  nobody asked for is executed differently but counted right. This is the scorer's convention for every form (it lets defaults such as VSS's
  shape=circle pass); it is not changed here. It matters most for the new forms where an optional key draws something (title, scheme,
  items2, layout of create). A decision for the owner.
- **VSS-BERT (combined-confidence.js agreement) compares canon values without engineNorm** (1030 false disagreements left, nearly all
  "every name" lists and arrange): its fit (combine/combined_report.mjs) uses the same comparison, so browser and fit agree; giving it
  engineNorm means changing both and refitting (072 refits combined.json anyway). Not done here.
- **coincidences of the engine** (template count / scheme / last item, layout / axis / direction / property changed): the engine happened to do
  the same thing on the audit's drawings (a default count equal to the gold's; a scheme that left that template's drawing unchanged; a venn
  takes at most 3 items, so dropping the 5th of 5 changes nothing). Not equivalences.

## 3. Scoring (bench-canon.js canon / canonWant, ORDER_FREE; the collectors' and fit_report's "right")

fit_report.mjs, verdicts.mjs, combined_report.mjs and fit3.mjs score from the records' outcomes, which the collectors compute with canon /
canonWant (combined_report and fit3 recompute them and check they are equal). So every scorer of 072 goes through bench-canon.js, and fit3's
engine agreement through vote-confidence.js engineNorm.

Issues found (all in section 2): help aspect / topic defaults, `about` beside a topic, keys with no value written "?"; a whole-drawing
operation's "every shape" written two ways and its target order; restyle quantifier; pairing chain. ORDER_FREE entries added only where
logic.js ignores the order: the ten operations, distribute (it sorts by coordinate), align with a direction (an ops-plugin re-layout, not the
base-shape align). Not added: items of any template (templates.js gives item i place i and colour i, also in a cycle), arrange (see above),
align without a direction (the first target is the base), group (order of members is kept). Checked with the engine on two drawings.

**Help answers** are scored on topic and aspect, and on `about` only when there is no topic: that is what the engine answers with (`about`
beside a topic changes nothing; without a topic the reply says "I don't know “images” as something this editor can do", so it is part of the
answer). aspect=overview and topic=general are the defaults. A reader that cannot produce `about` (VSS: TRAIN_PLAN_1103.md, `about` is not a VSS
role) is scored wrong on those requests (synth_rules_ext 131, opus_ext_1 10, short3 2 requests with `about` and no topic), not silently right.
`about` is compared as lower-case text: "add images" vs "images" counts as different, though both replies say they do not know it.

label="" vs label=null: different in the engine (removes the label / asks what it should say), kept different.

**Regress** (`SERIAL=1 GATE=cost bash training/sketch/regress.sh`, HEAD models): one intended change. Before -> after:

| set | Rules | VSS |
|---|---|---|
| sample (4858 gold) | 69.1/15.5/15.4 +769 (unchanged) | **76.0/11.8/12.2 -> 77.8/10.0/12.2** +309 |
| short: templates (1140) | 98.9/0.4/0.8 +4 (unchanged) | 59.5/11.8/28.7 +76 (unchanged) |
| short: llm_short (3000) | 72.4/5.6/22.0 +375 (unchanged) | **66.9/9.4/23.7 -> 67.0/9.3/23.7** +400 |
| VSS gated, cost score | | 12.1 / 11.6 / 12.0 (unchanged; precision, right, asked identical) |
| rules sets, test_editor_history | unchanged | |
| test_diagram_ops | 255/255 (6 expected strings updated: they print the Rules' reading in canon form, which now writes a chain without pairing=chain and "every shape" of improve / respace / label kind=edge quantifier=all as target=mention(quantifier=all); the readings are unchanged) | |

Cause of the VSS change: 242 gold wires of the sample are chains (`connect from=A,B,C pairing=chain`); the VSS adapter writes the list without
pairing, which logic.js executes as the same chain; they were counted wrong (about 87 requests now right). 15 distribute wires changed by the
order-free target. The Rules write pairing=chain themselves, so their numbers do not move.

## 4. Confidence features and refit.sh

- **New acts and worlds**: vss-confidence.js / neural-confidence.js / the fits take the prior of a world or act from the calibration part
  (shrunk with k = 5) and use the overall rate (`world_prior_default` / `act_prior_default`) for one they never saw; a missing signal (null)
  reads as percentile 1, a feature never seen gives an empty table (percentile 0.5). No crash path.
- **Dry run** (a git worktree of HEAD + these fixes, so docs/model/confidence of the working tree was never written): refit.sh on fresh2 +
  short3 without pending (1113 messages) ran end to end in 3 min (rerun on main 903a84f + the final fixes: 2 min 57 s), all four parity
  tests ok. Then 60 synthetic messages of the new forms
  (question:help, command:improve, create template=timeline, set kind=edge; VSS worlds help and layout; 18 in the calibration part; some with
  null signals) were added to every record file and the fit steps rerun (SKIP_COLLECT=1): exit 0, the recomputed outcomes equal the recorded
  ones, the parity tests ok, and the new keys are in the files: sop-bert.json act_prior help 0.678, improve 0.825; vss.json world_prior help
  0.55, layout 0.60; vote3.json columns carry them too; combined.json's "vss" part has no help / layout key because every injected VSS request
  was paired (that part only fits unpaired VSS requests): the default applies. Nothing was dropped.
- **Calibration data of 072**: 072 calls refit.sh with DATA = the four fresh2 folders + the filtered short3, no CAL_FOLDERS, no SHORT_REC /
  SHORT_DATA: only their hash calibration parts are fitted on; no synthetic text. But the new forms are thin there: fresh2 has none, short3's
  calibration part has 52 (help 10, template 12, layout op 9, restyle 6, arrow label 5, free text 5, group 5) of 808 calibration requests. The
  per-act priors of these acts are fitted on 5-12 requests each; most of their weight comes from the shrinkage to the overall rate.
- **combine/collect_pair.mjs** (the collector of refit.sh) still computed the description signals of SOP-BERT with `desc:` heads only, while
  commit 903a84f taught neural-confidence.js, fresh2/collect_sop.mjs and precision_bert_collect.mjs the `desc2:` heads of a second described
  role. With a model that has desc2 heads (071's), sop-bert.json would have been fitted on signals the page computes differently. Fixed (the
  same line as collect_sop.mjs; no change for the shipped model, which has no desc2 heads).

## 5. The demo (ui.js) on the new forms, current models

Run in Chromium (as test_vote_ui.py) on the HEAD models with these fixes: 15 messages (3 help questions, a timeline, a title, tidy up, all
arrows dashed, reverse, label an arrow, remove an arrow's label, group, ungroup, undo 2 times, sort by name, 3 stars in a row with a black
outline). No page error (one console error: fonts.googleapis.com is blocked here). test_vote_ui.py and test_combined_ui.py PASS.

- The current learned readers mostly do not read these forms: they ask, or (tidy up, can I add images?, group, sort by name) the shared VSS
  cut gives no unit and no tab reads anything. The Rules read most of them right (help answered, timeline drawn, arrows dashed, reverse,
  label, undo 2).
- A help answer is a request like any other: the 3 readers / VSS-BERT details show who read it the same, and when executed the reply is the
  answer text with its example buttons. With the current models no learned reader read a help question as help (SOP-BERT read "how do I change
  the colour of a shape?" as `ask=property`), so all were held.
- **Executed wrong (not a gate bug)**: VSS-BERT executed "remove the label of the arrow from Process to Check" as *disconnect* (the arrow was
  deleted), and "draw 3 stars in a row with a black outline" as black stars not in a row; SOP-BERT and VSS-BERT executed "label the arrow from
  Process to Check "ok"" as a connect with a label (nothing changed: the arrow existed). In each case SOP-BERT and VSS read the same wrong thing,
  so they agree; the 3 readers tab held all three (the Rules read them right). No case of "both produced nothing" counting as agreement: the
  vote and VSS-BERT only build items from produced requests, and agreement of an empty side is 0.
- **Fixed, the words of a held request**: the pairing pairs readings of one act, so a reader that read the same words as another action was
  said to have "not found this request" ("the Rules did not find this request" for a request the Rules read as `label`). vote-confidence.js
  `otherAct` now gives the overlapping reading of another act and ui.js passes it, so the reason reads "VSS and SOP-BERT agree, the Rules read
  it as ‘label’ instead of ‘connect’" (VSS tab, SOP-BERT tab, 3 readers).

## 6. The VSS round trip (convert_check.py), "differs"

Run as job 070 does (LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1, 070's EXTRA_DIRS, its world table): differs 13.9% of base, 15.4%
synth_rules, 18.1% fresh2 (the plan's numbers). A sample of 100 "differs" rows (50 fresh2, 50 synth_rules, random, seed 1103), each with its
world row (tokens and roles), classified by the first cause:

| class | fresh2 | synth_rules | all |
|---|---|---|---|
| A. real conversion loss (the row cannot give the gold) | 18 | 33 | **51** |
| B. check artifact (the row gives the gold; the comparison is wrong) | 7 | 3 | **10** |
| C. convention: a reference the gold resolves and the row leaves to the context filler, which convert_check does not run | 25 | 14 | **39** |

- **B (10)**: chains without pairing=chain, 8 (fixed by the canon fix: logic.js executes them the same); "arrange everything" written with a
  target the gold leaves out, 2 (convert_check compares the union of keys, the scorer only the gold's keys; not changed).
- **C (39)**: "it", "them", "she", "this one", "those two", "both of them", "the copies", ellipsis ("Isp2 too"), a colour said in an earlier
  sentence: the world row keeps the reference (or leaves a gap) for the context filler; the gold has the resolved names. 4 of the 39 lost
  the pronoun itself in the normalization ("line them up" -> "align up", "move it up" -> "move up"), so the row has no reference word left.
- **A (51), the causes**: a position relation lost (left of / right of / around -> near / at the left / in the middle) 10; a typo the front
  does not know (hexaons, Lainch, Shirne, rigth, betwen) 9; a description used as anchor or target lost (the newest triangle, the aqua thing,
  the violet rhombus) 8; notColor ("isn't red", "not black") 5; ask=rules read as list ("what rules are set") 5; the verb lost ("spread ...
  out", "line all three up", "Consumers small and teal") 5; names the span does not contain (the neurons, the three panels, Q1 to Q4) 4; `$new`
  inside a list (Pager and the copies) 2; another value (plural shape word, "vertically" = column, a label text) 3.

Real losses and context references dominate, so the check was not changed (the conversion is another agent's). With the new canon the share
of "differs" falls from 18.1% to 15.7% on fresh2 and from 15.4% to 14.5% on synth_rules (recomputed from the same rows). The new canon also
makes a world row without a target for a whole-drawing operation (where the gold lists shapes) count as "every shape" in convert_check:
0.00% -> at most 0.50% of a trained folder (opus_gen_1; base 0.37%), under 070's 1% gate. That is the truth (the engine does every shape),
and 070's gate still passes.

## 7. Files changed

- docs/js/bench-canon.js: `same()` (the engine-true equivalences, comment in the file), ORDER_FREE for the whole-drawing operations,
  distribute and align with a direction (`n: 0` = any length), keys with an undefined / null value or an empty list are no keys.
- docs/js/vote-confidence.js: `listFree` (arrange without a template, distribute, the ten operations, align with a direction) and `edgeAll`
  (restyle / reverse / label of every arrow) in engineNorm and engineTargets; `otherAct`.
- docs/js/ui.js: the held reasons pass `otherAct` when a reader has no reading of the same act (5 call sites).
- training/sketch/combine/collect_pair.mjs: desc2 heads in the SOP-BERT signals (as collect_sop.mjs).
- training/sketch/confidence3/audit_new_forms.mjs (new): the audit of sections 1-2.
- training/sketch/test_vote_confidence.mjs: 12 engine-equal and 10 engine-different pairs of the new forms, two scorer checks, otherAct.
- training/sketch/test_combined_confidence.mjs: the VSS-BERT agreement on help / improve / restyle, both ways.
- training/sketch/test_diagram_ops.mjs: 6 expected canon strings (section 3).
- training/laptop/jobs_draft/072_measure.sh: a guard that stops the job when bench-canon.js / vote-confidence.js predate these fixes, and the
  audit run into results/072_measure/audit_new_forms.md.

## 8. Job 072

072 as queued on gpu-runs (4c21b7d, held by 98017f0) runs on the code of main fa464f4: it would not crash, but it would score the new forms
with the false "wrong"s and "right"s above and refit vote3.json on the false disagreements (the help, layout and restyle requests of short3 are
exactly the ones the new readers were trained on). It must not run on that code: commit these changes, merge main into gpu-runs, and copy
jobs_draft/072_measure.sh (with the guard) to jobs/ before 071 / 072 are released. 070 is not affected (its gate passes with either canon).
