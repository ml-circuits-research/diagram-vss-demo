import { readFileSync, writeFileSync } from "node:fs";
const r = JSON.parse(readFileSync("result.json", "utf8")), A = r.withInherit, B = r.noInherit, cls = r.cls, L = (v) => Object.keys(cls).filter((t) => cls[t] === v);
const p = (n) => `${n} (${(100 * n / r.I).toFixed(1)}%)`;
const o = `# Verbless requests: how well can the legend pick the action from gold roles

Front end: docs/model/fix_p80_s0/front.json + docs/js/front.js normalize(); event tokens = all verbs of the legend events in docs/model/fix_p80_s0/model.json. Data: FIT split only (split_of(m, 0.8)), sonnet_msg + haiku_msg: ${r.nFit} messages. Script: /tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/verbless/verbless.mjs (classes.json = my reading of the triggers, written by mkclasses.mjs; this file by mkreport.mjs). No repository file edited; test sets not opened.

## Counts
- Gold requests whose span has no event token after normalize(): ${r.nNoEvent}
- (i) truly verbless (trigger is a name, value, position phrase, superlative or noun phrase): ${r.I}
- (ii) a verb or question phrase is in the text but the front end has no event token for it: ${r.II}. Examples: ${r.II_examples.slice(0, 10).map((x) => `"${x.span}" (trigger "${x.trigger}")`).join("; ")}.

## Frames used
Source: the legend text of training/sketch/llm_train/TRAIN_MSG_SPEC.md ("Commands, by action", "Questions, by ask", Facts, Rules), parsed by code, because docs/js/logic.js lists legend questions and values, not keys per action. A question is written "?ask". Printed:
\`\`\`
${readFileSync("frames.txt", "utf8")}\`\`\`
Parser note: my first parse dropped the keys written as "(+ anchor)" and "(+ distance in pixels)" (move had no anchor or distance). I saw it in the printed frames, fixed the parser (not the rule) and re-ran. Before the fix: with inheritance right 161 (77.0%), wrong 1, ask 47 (22.5%). Only the numbers below are final.

## Result on (i), n=${r.I}
| | right | wrong | ask |
|---|---|---|---|
| with inheritance (a, b, c) | ${p(A.right.length)} | ${p(A.wrong.length)} | ${p(A.ask.length)} |
| without inheritance (b, c) | ${p(B.right.length)} | ${p(B.wrong.length)} | ${p(B.ask.length)} |

Inheritance gives 181 of the 184 right answers; the unique-frame step alone settles 30 (12 connect "X to Y", 15 create noun phrases, 3 move). Of the 24 asks, 17 have no previous request in the message; the asks are mostly "Name + place" (move, 15) and "Name + colour/size" (set 6 and fact 1), where 3-4 frames fit.

## Wrong cases (all)
${A.wrong.map((x) => `- span: "${x.span}"; previous: "${x.prev}"; gold: ${x.gold}; rule answered: ${x.ans} (${x.how}). This span has a verb ("push"), so by reading it belongs in (ii); I classified by the trigger word "front" before running and keep it in (i). Without it: 184 right, 0 wrong, 24 ask of 208.`).join("\n")}

## 10 ask cases (span | gold keys | previous request [its action] | gold | why asked)
${A.ask.slice(0, 10).map((x) => `- "${x.span}" | ${x.K.join(",")} | ${x.prev || "(none)"} | ${x.gold} | ${x.how}`).join("\n")}

## Classification (trigger lists, decided by reading)
(i): ${L("i").join(" | ")}

(ii): ${L("ii").join(" | ")}

Label noise seen: "Paint a red circle", "Delete red", "Stay yellow", "Come red", "Black a black circle" are annotated with the first word as a shape name (set on target Paint / Delete / Stay / Come / Black). I followed the annotation and kept them in (i).

## Verdict
The rule does not pass the threshold: wrong is 0.5% (<= 3%, fine) but right is 88.0% (< 90%), with 11.5% ask; almost all of the right answers come from inheritance (without it only 14.4% right).
`;
writeFileSync("VERBLESS.md", o);
