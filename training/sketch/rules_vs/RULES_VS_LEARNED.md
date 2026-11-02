# RULES_VS_LEARNED: where and why the Rules beat the learned readers on short commands (2026-11-02)

Question (owner, 2026-11-02 21:57): "Our data seem very bad: the rules engine catches better and more what I want than VSS and Neural."
Readers measured: Rules (docs/js/logic.js), VSS-G (docs/model/micro/registry.json, today's demo VSS), SOP-BERT G (docs/model/neural/sop-bert, today's demo Neural).
Nothing in docs/ was changed; nothing was committed. Scripts and data are in this folder (section 9).

## 0. The direct answer

Short answer: the data are not bad in general, but they do not cover what the owner types, and for VSS the safety gate hides what it can read.
Three separate causes, in order of how much they explain:

1. **VSS-G asks about most short commands (the gate), and its worlds never trained on short commands.** On 3000 realistic one-line commands VSS-G
   reads 66.9% right if forced to execute (Rules 70.8%), but at the demo's safety threshold it does 30.3% right and does not act on 69.0% (it asks, or reads nothing).
   A person typing short commands sees "Rules did it, VSS asked". The VSS worlds were trained on 6440 messages of which only 709 (11%) are one-request
   messages; the 3000 one-line commands trained only the VSS cutter, not the worlds (section 5).
2. **SOP-BERT G reads one-liners well when it trained on them, but it reads the Rules' own sentences worse than the Rules.** On llm_short (all 3000 are its training
   data) it is right 90.6% executing everything, 83.4% at its threshold (Rules 70.8%). On the sentences written by the Rules' author and on the demo's help examples it drops:
   85.4% (written sets) and 73.4% (help sentences) executing everything, 72.9% / 63.3% at the threshold, against 92.5% / (94.9%) for the Rules.
   Cause (100 hand-classified cases, section 3): 27 are a phrasing, word or feature the training data hardly or never has; 5 are a label convention that differs;
   10 are read right but the confidence asks; 58 are real reading errors on constructions the training data does have (mostly a description such as "the black diamonds" read with the wrong shape/colour).
3. **The template sets (the 1140 one-line test sentences made from the Rules' cues) favour the Rules, so they make the gap look larger than it is.** Rules 98.3% right there,
   VSS-G 59.5%, SOP-BERT G 69.0% (28.9% wrong). The biggest part of SOP-BERT's wrong answers there (302 requests) is a description or "everything" as the object of a request
   (target 125, from 72, anchor 46, to 41 of the key differences), which is 2.0% of the role fillers in the training data.

"The rules catch more" is true against VSS-G gated and on the Rules' own wording; it is **not** true against SOP-BERT on realistic one-line commands (it does 0.1% not done
vs the Rules' 23.4%). Which part of the data is the problem: (a) **coverage of short commands with descriptions and the demo's advertised features** (group, outline, x/y positions,
"X is connected to Y", "what does X say", "remove all connections"), (b) **phrasing**: rare synonyms (erase, wipe out, detach, discard, sketch me, upper left), (c) **conventions** (5 of 100: "connect A and B",
"everything" as a target, a default axis); **not** a mass of wrong labels. What would fix it is in section 7; I did not train anything, so none of the fixes is measured.

## 1. What was run

- Each reader on every set with the collectors of fresh2 (training/sketch/fresh2/collect_{rules,vss,sop}.mjs, unchanged; SOP-BERT with its own cut), outcome per requested action by the
  same pairing as the earlier reports (PAIR=value). The demo's models and confidence files as they are today: docs/model/confidence/vss.json (threshold 0.8964), sop-bert.json (0.8233), level "cost".
- "Executes everything" = Rules, VSS, SOP-BERT with no gate (the earlier measure). "Gated" = the learned reader executes a request only when its confidence is at or above the threshold of the cost level; below it the request is asked and counts as not done. Extras = executed requests nobody asked for (a count).
- Cell = **right % / wrong % / not done %** of the requested actions, then **· extras**. Wrong = executed with a wrong value, shape or action. Not done = no request produced for it, or asked (gated).
- Sets: llm_short = the 3000 one-line commands (training/sketch/llm_train/{sonnet,haiku}_short, annotated by LLM agents, 1 request each); the six template sets docs/bench/{hand,blind,broad,seen,new_identities,heldout_formulations} (1140 requests);
  the fresh2 test part (405 messages, 1313 requests, messages with int(sha256(id),16) % 3 != 0; the part already read, so descriptive only); the demo's help sentences (section 2d).
- What each learned reader trained on: **llm_short: SOP-BERT G trained on all 3000 (they are in its data), the VSS cutter trained on them, the VSS worlds and context filler did not.**
  The six template sets: nobody trained on them (they were only exported for evaluation). fresh2: nobody trained on it (it only fitted the confidences, calibration part).
  So the llm_short numbers of SOP-BERT are a fit on its training data, not a test; those of VSS-G are partly (cutter) the same.

## 2. Results by kind of input

### 2a. realistic one-line commands (llm_short, 3000 requests)

**(a) llm_short: 3000 one-line commands (1 request each)**

| situation | requests | Rules | VSS-G | VSS-G gated | SOP-BERT-G | SOP-BERT-G gated |
|---|---|---|---|---|---|---|
| all | 3000 | 70.8% / 5.8% / 23.4% · 397 | 66.9% / 9.4% / 23.7% · 400 | 30.3% / 0.8% / 69.0% · 31 | 90.6% / 9.3% / 0.1% · 2 | 83.4% / 3.2% / 13.4% · 0 |
| written by Sonnet | 1500 | 69.8% / 5.1% / 25.1% · 225 | 67.8% / 8.0% / 24.2% · 216 | 29.5% / 0.7% / 69.9% · 19 | 90.9% / 9.0% / 0.1% · 2 | 81.3% / 2.7% / 15.9% · 0 |
| written by Haiku | 1500 | 71.9% / 6.5% / 21.7% · 172 | 66.1% / 10.7% / 23.2% · 184 | 31.1% / 0.9% / 68.1% · 12 | 90.4% / 9.6% / 0.0% · 0 | 85.4% / 3.7% / 10.9% · 0 |
| commands | 1825 | 67.0% / 8.1% / 24.9% · 215 | 66.6% / 11.5% / 21.9% · 206 | 21.6% / 0.0% / 78.4% · 2 | 86.8% / 13.2% / 0.0% · 0 | 80.6% / 4.3% / 15.1% · 0 |
| questions / facts / rules | 1175 | 76.8% / 2.2% / 21.0% · 182 | 67.4% / 6.1% / 26.5% · 194 | 43.7% / 2.0% / 54.3% · 29 | 96.6% / 3.2% / 0.2% · 2 | 87.7% / 1.5% / 10.8% · 0 |

Reading: executing everything, SOP-BERT is far ahead (90.6% right, but it is its own training data) and VSS-G is about level with the Rules (66.9 vs 70.8) with more wrong (9.4 vs 5.8) and
nearly the same number of extras. At the safety threshold VSS-G executes little (30.3% right, 0.8% wrong): it asks about 69%. SOP-BERT keeps 83.4% right with 3.2% wrong, better than the Rules on both.
Questions, facts and rules are read better by everyone than commands (Rules 76.8% vs 67.0%). Rules extras 397 = 13 per 100 requests.

Some actions (all in the same set; the full table is tables_out.md). Rules lose on toFront/toBack, degree, create, label; VSS-G loses on question:rules (3.3%), connect (37.2% wrong), create (26.2% wrong):

**(a2) llm_short by action (actions with >= 40 messages)**

| situation | requests | Rules | VSS-G | VSS-G gated | SOP-BERT-G | SOP-BERT-G gated |
|---|---|---|---|---|---|---|
| command:create | 309 | 68.0% / 6.5% / 25.6% · 39 | 51.8% / 26.2% / 22.0% · 47 | 6.8% / 0.0% / 93.2% · 1 | 93.5% / 6.5% / 0.0% · 0 | 89.0% / 6.5% / 4.5% · 0 |
| command:set | 205 | 63.4% / 10.2% / 26.3% · 11 | 72.7% / 4.4% / 22.9% · 23 | 19.0% / 0.0% / 81.0% · 0 | 82.9% / 17.1% / 0.0% · 0 | 78.0% / 0.0% / 22.0% · 0 |
| command:move | 185 | 70.3% / 15.1% / 14.6% · 9 | 90.8% / 2.7% / 6.5% · 9 | 40.5% / 0.0% / 59.5% · 0 | 97.8% / 2.2% / 0.0% · 0 | 93.5% / 1.1% / 5.4% · 0 |
| command:connect | 172 | 57.0% / 15.7% / 27.3% · 27 | 57.6% / 37.2% / 5.2% · 6 | 0.0% / 0.0% / 100.0% · 0 | 67.4% / 32.6% / 0.0% · 0 | 66.3% / 27.3% / 6.4% · 0 |
| question:check | 142 | 87.3% / 2.8% / 9.9% · 15 | 78.2% / 8.5% / 13.4% · 9 | 76.8% / 4.9% / 18.3% · 0 | 90.1% / 8.5% / 1.4% · 2 | 73.9% / 0.0% / 26.1% · 0 |
| command:delete | 89 | 69.7% / 16.9% / 13.5% · 2 | 65.2% / 15.7% / 19.1% · 7 | 46.1% / 0.0% / 53.9% · 0 | 62.9% / 37.1% / 0.0% · 0 | 51.7% / 1.1% / 47.2% · 0 |
| question:count | 76 | 89.5% / 9.2% / 1.3% · 1 | 68.4% / 25.0% / 6.6% · 2 | 55.3% / 3.9% / 40.8% · 0 | 89.5% / 10.5% / 0.0% · 0 | 88.2% / 10.5% / 1.3% · 0 |
| fact: | 72 | 77.8% / 6.9% / 15.3% · 9 | 93.1% / 1.4% / 5.6% · 2 | 0.0% / 0.0% / 100.0% · 0 | 98.6% / 1.4% / 0.0% · 0 | 83.3% / 0.0% / 16.7% · 0 |
| command:arrange | 63 | 60.3% / 6.3% / 33.3% · 14 | 54.0% / 6.3% / 39.7% · 1 | 15.9% / 0.0% / 84.1% · 0 | 82.5% / 17.5% / 0.0% · 0 | 25.4% / 0.0% / 74.6% · 0 |
| rule: | 62 | 62.9% / 0.0% / 37.1% · 10 | 50.0% / 4.8% / 45.2% · 18 | 1.6% / 0.0% / 98.4% · 0 | 98.4% / 1.6% / 0.0% · 0 | 96.8% / 1.6% / 1.6% · 0 |
| command:align | 61 | 65.6% / 9.8% / 24.6% · 14 | 60.7% / 11.5% / 27.9% · 7 | 0.0% / 0.0% / 100.0% · 0 | 63.9% / 36.1% / 0.0% · 0 | 59.0% / 4.9% / 36.1% · 0 |
| command:toFront | 61 | 42.6% / 1.6% / 55.7% · 16 | 57.4% / 8.2% / 34.4% · 17 | 19.7% / 0.0% / 80.3% · 0 | 80.3% / 19.7% / 0.0% · 0 | 68.9% / 1.6% / 29.5% · 0 |
| question:cycle | 61 | 77.0% / 0.0% / 23.0% · 14 | 55.7% / 0.0% / 44.3% · 5 | 19.7% / 0.0% / 80.3% · 1 | 100.0% / 0.0% / 0.0% · 0 | 100.0% / 0.0% / 0.0% · 0 |
| command:toBack | 61 | 32.8% / 1.6% / 65.6% · 24 | 65.6% / 6.6% / 27.9% · 13 | 32.8% / 0.0% / 67.2% · 1 | 80.3% / 19.7% / 0.0% · 0 | 70.5% / 1.6% / 27.9% · 0 |
| question:rules | 61 | 93.4% / 0.0% / 6.6% · 3 | 3.3% / 0.0% / 96.7% · 51 | 0.0% / 0.0% / 100.0% · 20 | 100.0% / 0.0% / 0.0% · 0 | 100.0% / 0.0% / 0.0% · 0 |
| question:degree | 61 | 34.4% / 0.0% / 65.6% · 34 | 82.0% / 0.0% / 18.0% · 10 | 63.9% / 0.0% / 36.1% · 1 | 100.0% / 0.0% / 0.0% · 0 | 96.7% / 0.0% / 3.3% · 0 |
| question:exists | 61 | 72.1% / 3.3% / 24.6% · 13 | 49.2% / 9.8% / 41.0% · 4 | 27.9% / 1.6% / 70.5% · 3 | 96.7% / 3.3% / 0.0% · 0 | 41.0% / 0.0% / 59.0% · 0 |
| command:distribute | 60 | 75.0% / 6.7% / 18.3% · 1 | 66.7% / 13.3% / 20.0% · 1 | 0.0% / 0.0% / 100.0% · 0 | 66.7% / 33.3% / 0.0% · 0 | 56.7% / 3.3% / 40.0% · 0 |

### 2b. the six template short sets (they favour the Rules)

These sentences were written by the Rules' author or generated (generate.py) from the Rules' own cue words and templates, so the Rules were built for them (AGENTS.md "Fair comparison").
Nobody else trained on them. Use only to see how far a reader is from the Rules' wording.

**(b) the six template short sets (written by the Rules' author or generated from the Rules' own cues: they favour the Rules)**

| situation | requests | Rules | VSS-G | VSS-G gated | SOP-BERT-G | SOP-BERT-G gated |
|---|---|---|---|---|---|---|
| hand | 40 | 95.0% / 0.0% / 5.0% · 0 | 75.0% / 12.5% / 12.5% · 3 | 37.5% / 0.0% / 62.5% · 0 | 90.0% / 10.0% / 0.0% · 0 | 77.5% / 2.5% / 20.0% · 0 |
| blind | 60 | 83.3% / 3.3% / 13.3% · 5 | 66.7% / 10.0% / 23.3% · 9 | 36.7% / 0.0% / 63.3% · 0 | 88.3% / 11.7% / 0.0% · 0 | 71.7% / 5.0% / 23.3% · 0 |
| broad | 140 | 95.7% / 1.4% / 2.9% · 2 | 73.6% / 12.9% / 13.6% · 7 | 35.0% / 0.7% / 64.3% · 1 | 82.9% / 11.4% / 5.7% · 4 | 72.1% / 3.6% / 24.3% · 3 |
| seen | 300 | 100.0% / 0.0% / 0.0% · 0 | 56.3% / 8.7% / 35.0% · 20 | 19.0% / 0.7% / 80.3% · 4 | 70.7% / 27.7% / 1.7% · 33 | 55.0% / 4.7% / 40.3% · 2 |
| new_identities | 300 | 100.0% / 0.0% / 0.0% · 0 | 56.7% / 12.3% / 31.0% · 20 | 25.7% / 0.3% / 74.0% · 2 | 64.7% / 33.7% / 1.7% · 39 | 52.7% / 6.0% / 41.3% · 2 |
| heldout_formulations | 300 | 99.7% / 0.3% / 0.0% · 0 | 55.3% / 14.3% / 30.3% · 17 | 12.7% / 0.0% / 87.3% · 1 | 58.7% / 39.3% / 2.0% · 52 | 43.7% / 5.7% / 50.7% · 1 |
| written by hand (hand+blind+broad) | 240 | 92.5% / 1.7% / 5.8% · 7 | 72.1% / 12.1% / 15.8% · 19 | 35.8% / 0.4% / 63.7% · 1 | 85.4% / 11.2% / 3.3% · 4 | 72.9% / 3.8% / 23.3% · 3 |
| all six | 1140 | 98.3% / 0.4% / 1.2% · 7 | 59.5% / 11.8% / 28.7% · 76 | 22.6% / 0.4% / 77.0% · 8 | 69.0% / 28.9% / 2.1% · 128 | 55.2% / 5.1% / 39.7% · 8 |

### 2c. fresh2 test part (Opus-written messages, a writer nobody trained on), by length

**(c) fresh2 test part by number of sentences (descriptive; this part was already read)**

| situation | requests | Rules | VSS-G | VSS-G gated | SOP-BERT-G | SOP-BERT-G gated |
|---|---|---|---|---|---|---|
| 1 sentence | 128 | 72.7% / 8.6% / 18.8% · 9 | 78.1% / 10.9% / 10.9% · 9 | 33.6% / 0.0% / 66.4% · 0 | 87.5% / 10.9% / 1.6% · 2 | 74.2% / 7.8% / 18.0% · 0 |
| 2-6 sentences | 378 | 54.8% / 20.6% / 24.6% · 70 | 56.1% / 18.5% / 25.4% · 39 | 16.7% / 0.3% / 83.1% · 0 | 73.5% / 22.8% / 3.7% · 32 | 55.0% / 4.0% / 41.0% · 2 |
| 7+ sentences | 807 | 53.2% / 20.0% / 26.9% · 211 | 59.6% / 20.2% / 20.2% · 70 | 12.8% / 0.2% / 87.0% · 1 | 79.7% / 17.1% / 3.2% · 73 | 60.2% / 3.7% / 36.1% · 3 |
| all | 1313 | 55.5% / 19.0% / 25.4% · 290 | 60.4% / 18.8% / 20.8% · 118 | 15.9% / 0.2% / 83.9% · 1 | 78.7% / 18.1% / 3.2% · 107 | 60.1% / 4.2% / 35.7% · 5 |

Messages: 123 with 1 sentence, 181 with 2-6, 101 with 7+. Descriptive only (this part was already read; it fitted nothing but the confidences' calibration part is the other 1/3).
On one-sentence messages from an unseen writer the learned readers executing everything are ahead of the Rules (VSS 78.1, SOP-BERT 87.5, Rules 72.7 right); gated, SOP-BERT is level with the Rules
(74.2 vs 72.7, wrong 7.8 vs 8.6) and VSS-G is far behind (33.6, it asks 66%). On long messages everyone drops; SOP-BERT stays ahead of the Rules.

### 2d. the demo's own example sentences (a proxy for what the owner types)

79 single-request sentences of help.js (HelpKit.examples()) and docs-concepts.js. The gold here is **the Rules' own reading** (the sentences were written so that the Rules read them), so this is
agreement with the Rules, not a test of truth. The Rules' 5.1% "wrong" are four resize sentences whose scale argument my conversion of their reading to a gold wire does not reproduce (artefact).

**(d) the demo's own example sentences (help.js, docs-concepts.js): gold = the Rules' reading, so Rules = agreement by construction**

| situation | requests | Rules | VSS-G | VSS-G gated | SOP-BERT-G | SOP-BERT-G gated |
|---|---|---|---|---|---|---|
| help sentences, one request | 79 | 94.9% / 5.1% / 0.0% · 0 | 73.4% / 12.7% / 13.9% · 6 | 48.1% / 1.3% / 50.6% · 0 | 73.4% / 21.5% / 5.1% · 5 | 63.3% / 10.1% / 26.6% · 3 |

The learned readers agree with the Rules on 73.4% of them (executing everything); at their thresholds 48.1% (VSS) and 63.3% (SOP-BERT).

## 3. Where the Rules are right and a learned reader is not

Among the requests the **Rules read right**, what each learned reader does (rules_right.py):

| group | Rules right | reader | executes right | right but asked (gate) | wrong | not done |
|---|---|---|---|---|---|---|
| llm_short | 2125 | VSS-G | 38.4% | 37.4% | 7.8% | 16.4% |
| llm_short | 2125 | SOP-BERT G | 86.1% | 6.9% | 7.0% | 0.0% |
| written sets (hand, blind, broad) | 222 | VSS-G | 37.8% | 36.9% | 12.6% | 12.6% |
| written sets | 222 | SOP-BERT G | 74.8% | 12.2% | 11.3% | 1.8% |
| generated sets (seen, new_identities, heldout_formulations) | 899 | VSS-G | 19.0% | 37.0% | 11.8% | 32.1% |
| generated sets | 899 | SOP-BERT G | 50.4% | 14.2% | 33.6% | 1.8% |
| help sentences | 75 | VSS-G | 50.7% | 26.7% | 10.7% | 12.0% |
| help sentences | 75 | SOP-BERT G | 66.7% | 10.7% | 18.7% | 4.0% |
| fresh2 test part | 729 | VSS-G | 26.7% | 54.0% | 9.3% | 9.9% |
| fresh2 test part | 729 | SOP-BERT G | 74.1% | 16.7% | 8.0% | 1.2% |

So for VSS-G the gate is the largest single reason a request the Rules do is not done: 37% of the requests the Rules get right on the one-liners are read right by VSS and then asked
(the confidence is under 0.8964). For SOP-BERT the gate is 7-17%, and its wrong answers (7-34%) are the larger part.

### 100 cases classified (cases_view.txt, cases_classified.json)

Sample: 100 requests the Rules read right and a learned reader did not execute right, drawn with a fixed seed from five pools
(llm_short: VSS-G failures 30 of 514, SOP-BERT failures 15 of 149, right-but-asked 5 + 5; written sets: VSS 13 of 56, SOP 12 of 29; help sentences: VSS 10 of 17, SOP 10 of 17).
The sample is stratified, not proportional. For each case I ran all three readers again, printed what each produced against the gold, and looked in the 31746 training requests
(17 folders) for the construction, the words and the convention (lookup.py, conv_checks.py: counts below are from them). Cause = the first that explains it:

- **DATA**: the training data of that reader lacks the phrasing, word, action or key (absent or 5 or fewer spans), and the error is on that part.
- **CONV**: the output differs from the Rules' because the training annotation uses another convention.
- **ASK**: the reader read it right; its confidence is under the threshold.
- **ERR**: the construction is in the training data (usually with many same-shape sentences) and the reader still read it wrong or not at all.

| situation | cases | DATA | CONV | ASK | ERR |
|---|---|---|---|---|---|
| llm_short | 55 | 2 | 0 | 10 | 43 |
| written sets (the Rules' author's wording) | 25 | 12 | 0 | 0 | 13 |
| help sentences | 20 | 13 | 5 | 0 | 2 |
| **all** | **100** | **27** | **5** | **10** | **58** |
| VSS-G cases (58) | | 14 | 2 | 5 | 37 |
| SOP-BERT cases (42) | | 13 | 3 | 5 | 21 |

Examples (what the Rules did is the gold; the reader's output is after the arrow):

- DATA, phrasing: "Erase Done" (VSS duplicates; 'erase' has 3 training spans in all, 1 in the worlds' data); "Detach Done from Check" (VSS connects it; 'detach' 2 spans, none in the worlds' data);
  "Wipe out the red ones" (SOP-BERT drops the colour; 'wipe' 5 spans); "Throw a big yellow star in the upper left corner" (SOP puts it top right, VSS drops the place; 'upper' in 3 spans);
  "discard the default rules you saved" (VSS: nothing); "Could you sketch me a tiny purple hexagon?" (VSS: nothing); typos ("how many cricles", "make Strat yelow": the demo's spell checker may fix these).
- DATA, features the Rules have and the training data has never had: "Give Process a red outline" (0 training spans with an outline key; both readers write colour=red); "Group Start and Process as Intake"
  (14 training spans mention groups, none annotates a group action; SOP-BERT reads it as a label); "How many groups are there?"; "Draw a circle named Hub at 400, 250" (0 spans with coordinates; VSS reads count=400);
  "Done is connected to Start" (Rules: a fact; 0 training facts of that kind; both readers read a question); "What does Process say?" ('say' occurs in 5 question spans, none about a label); "Remove all connections" (0 disconnect spans with all/every).
- DATA, descriptions as objects: "connect the red circle to Done" (SOP-BERT drops the source: descriptions are 0.1% of connect 'from' fillers in training); "delete the stars that are not yellow" (SOP reads 'all', drops stars and 'not yellow'; 4 training spans have delete + not <colour>).
- CONV: "Connect Start and Check with a two-way arrow" (the training annotation writes "connect A and B ..." as from=A,B with no 'to' in 61 of 78 spans; the Rules write from A to B); "Arrange everything in a grid" and
  "Distribute the shapes evenly" (training leaves the target empty for "everything": 0 of 60 arrange-everything spans write 'all'; the Rules write a mention of all shapes); the Rules' default axis for "distribute ... evenly".
- ASK: "disconnect Millet and Sorghum" (VSS-G right, confidence 0.65 < 0.8964); "new squares should be small from now on" (0.86); "is there a navy circle" (SOP-BERT right, 0.79 < 0.8233); "arrange the circles in a row" (0.51).
- ERR, SOP-BERT (21): reads the description's attribute wrong although the construction is common: "make all the black diamonds white" -> all circles; "bring the newest hexagon to the front" -> newest square;
  "arrange all the hexagons in a circle" -> squares; "make the last circle yellow" -> the oldest circle ('last' is annotated 'newest' in 25 of 25 training spans); "add a gray ellipse at the top right" -> green;
  "draw a navy line from User to Ledger" and "line, no arrow heads, Mic to Amp" lose the arrow=none ('line' without 'arrow' is annotated arrow=none in 97% of 579 training spans), the second with confidence 0.99.
- ERR, VSS-G (37): "tell me the rules", "list the defaults in effect", "what rules have been defined" read as list (216 training 'rules' questions); "how large is the Lotus" read as a fact; "which red shape is farthest from Ball" drops the colour;
  "change all the purple things to teal", "arrange the whole thing in a column", "is there a loop between rooms": the cutter makes no unit; "add a lime hexagon to the right of Spruce", "draw a purple square to the left of Start":
  read as a question (check) because of the region phrase; "call the Dew Mist" swaps name and target; "count all the boxes": 'box' not mapped (in 61 of 65 create spans 'box' is annotated rectangle, so the label is consistent).

Notes on the sample: llm_short has few DATA cases (2 of 55) because those sentences, or ones of the same shape, are in the training data (that is also why SOP-BERT's 9.3% wrong there are reading errors on its own training data:
the head that reads a description's attributes is its weak point). The Rules-phrased sets (written, help) are mostly DATA, which says the training data do not contain what the Rules' author expects people to type. The sample does not say
how common each cause is in all failures; for that, the population table above (the gate) and the generated-set key counts (section 4) are the better guides.

## 4. Why the generated sets are so bad for SOP-BERT

302 SOP-BERT wrong requests on seen, new_identities and heldout_formulations, compared key by key with the gold: target differs in 125, from 72, position 57, anchor 46, to 41, color 30, pairing 19, arrow 19.
In 109 of the target cases the gold is a description or "everything" ("turn the gray diamond black", "arrange everything in a row") and SOP-BERT writes nothing or an empty description. In "from"/"to"/"anchor" the gold is a description
("link the cyan circle to B", "put it near the star") and SOP-BERT leaves the role empty or writes the bare word. In the training data a description fills only 2.0% of the name roles of requests (702 of 34587; delete target 31.3%, arrange 8.4%,
set target 4.2%, connect from 0.1%, connect to 0.7%, move anchor 0.2%, create anchor 0.0%; role_desc.txt). Some of the gold here (a "box" is a rectangle mention) is the Rules' convention, so part is label convention, not reader error; I did not separate them.

## 5. The training data the learned readers use (training/neural/ALL_DATA.md + llm_train/opus_*)

17 folders, 9440 messages, 31746 requests (the SOP-BERT G data; the VSS-G worlds use the same except sonnet_short and haiku_short, which only train the VSS cutter). Script: train_stats.py (train_stats.json).

| | messages | share of 9440 |
|---|---|---|
| one request in the message | 3709 | 39.3% |
| one request and one sentence | 3591 | 38.0% |
| one request, one sentence, at most 8 words | 3213 | 34.0% |
| of the one-request one-sentence ones, starting with the bare command (no "please", "can you", "I want", "now") | 3498 | 97% of them |
| coming from sonnet_short + haiku_short | 3000 | 80.9% of the one-request messages |
| one request in the 6440 messages **outside** the two short folders (what the VSS worlds are trained on) | 709 | 11.0% of 6440 (2.5% of their requests) |

- Requests in one-request one-sentence messages: 3591 of 31746 = 11.3% of all training requests. All the other 88.7% are in messages with several requests, median 14 to 121 words per message (the five long folders 23 to 121).
- Per folder: the five main LLM folders (sonnet_msg, haiku_msg, sonnet_msg2, haiku_msg2, sonnet_long) and the sonnet_spans/haiku_spans have 0 to 14 one-request messages each; fresh1 haiku 33; the Opus folders 95 to 142 per 300; the two short folders 1500 each.
  So the short commands exist as a block of 3000 written by two LLM agents (Sonnet, Haiku) with one prompt style each; the other writers and personas almost never write a one-line command.
- What the demo's help and examples suggest (90 sentences of help.js and docs-concepts.js): 89 are one sentence, 89 start with the bare command, 81 have at most 8 words (median 5), 9 of 79 single-request ones involve a description or "all".
  Same masked shape (names, colours, shapes, sizes and numbers masked) as a training one-request message: 48 of 90 (53%); same first three words: 71 of 90 (79%). Not at all in the training data: group, ungroup,
  outline, x/y positions, "X is connected to Y" statements, "what does X say". The 42 not matched (list in the output of train_stats.py) are mostly the sentences with a place phrase ("in the center", "to the top right"), "all"/"everything", a label in quotes, and those features.
- So the training data hold a lot of the right kind of text (39% of the messages are one request, nearly all bare commands), but (1) it is one block from two writers, (2) 98% of its role fillers are bare names, not descriptions, and
  (3) the VSS worlds, the part that reads the roles, never saw the block.

## 6. Answer: are our data bad?

- **Wrong labels:** not the main problem. Only 5 of the 100 cases are a convention difference; 4 more patterns (the 'line' arrow, 'last' newest, 'box' rectangle, 'notColor') are annotated consistently (94% to 100%) and the readers are the ones that miss them.
- **Coverage of short commands: yes, for VSS.** The VSS-G worlds trained on 709 one-request messages (2.5% of their requests), the cutter saw the 3000, and the confidence was fitted on multi-sentence fresh2 messages; the result is a reader that, forced, is level with the Rules
  (66.9 vs 70.8 on one-liners) but whose confidence asks 69% of them. For SOP-BERT the short commands are covered (it reads its own 3000 at 90.6%), but nobody measured it on a short set it has not seen written by someone else: the only unseen short
  texts (template sets, help sentences) are in the Rules' wording and it does worse there (59% to 85%).
- **Phrasing: yes, for the words the Rules know and people use less often** (erase, wipe out, detach, discard, sketch me, upper left, "remove all connections", "what does X say") and for every feature the demo advertises that the training legend does not have
  (group/ungroup, outline, x/y positions, "X is connected to Y"). 27 of the 100 cases.
- **Descriptions as the object of a short command** ("connect the red circle to Done", "delete the stars that are not yellow", "make all the black diamonds white"): the biggest content gap in the data (2.0% of role fillers) and the main
  source of SOP-BERT's wrong answers on short commands.
- **Conventions:** 5 of 100; to fix by a decision (what does "connect A and B", "everything", "distribute" with no axis mean) written once and applied to all data, not by more data.
- **The gate:** for VSS-G it is not a data question but a calibration one: the confidence was fitted on long messages and puts 37% of correct short answers under the threshold. Executing less is its design (one mistake = 10 right answers); the cost is that the
  demo looks worse than the Rules on exactly the input the owner tries first.

## 7. What data would fix it (a hypothesis, not measured)

1. **Short one-request commands with descriptions in every role**, several writers and personas, annotated like llm_short: "connect the red circle to the blue star", "move Gem under the last diamond", "delete the stars that are not yellow",
   "make all the black diamonds white", "arrange everything in a grid"; a few hundred per action that takes a description (set, delete, move, connect, arrange, align, resize, check), with colour, shape, quantifier (all/every/each), recency and negation in different combinations.
   The VSS worlds must train on them (today they do not train on the short folders). This targets causes ERR and DATA in section 3.
2. **The phrasings the Rules know**: the cue words of the legend values in docs/js/logic.js that the training data has fewer than ~10 times (erase, wipe out, detach, discard, sketch me, upper/lower, get rid of, "remove all"), written by LLM agents in
   sentences (AGENTS.md: realistic, never template-generated), 20 to 50 per trigger. The training data itself decides what is missing: count the Rules' cue words in the training spans (conv_checks.py does it for a few).
3. **The features the demo advertises**: group/ungroup, outline, x/y positions, "X is connected to Y" statements, "what does X say", "remove all connections", with their legend entries, in the same short style (about 50 each).
4. **A decision on conventions** (5 of 100, plus the generated sets' "box"): connect A and B, "everything" as a target, default axis; re-annotate the existing data to it (label review) instead of adding data.
5. **A short-command calibration set** written by someone who is not in the training data (the Opus writers of fresh2 wrote long messages: 123 of 405 test messages have one sentence), 300 to 500 one-liners in the owner's style
   (help.js phrasing), used only to refit the two confidences. Without it the gate cannot be tuned for short commands, and the 90.6% of SOP-BERT on llm_short stays a training-data number.
6. **The owner's own typed commands** from the demo (the feedback path of FEEDBACK_PLAN.md) are the closest thing to the real distribution.

## 8. Limits

- llm_short is training data of SOP-BERT G and (cutter only) of VSS-G: their numbers there are not tests. The sets that are tests for them (template sets, help sentences) are in the Rules' wording; fresh2 has few one-sentence messages (123).
- The 100 cases are a stratified sample classified by me by reading each output and the training counts; the causes are my judgement from counts, not a retraining. The help-sentence "gold" is the Rules' reading.
- The templates' gold and the llm_short annotation can themselves differ from each other in conventions (not separated beyond section 3).
- The VSS spell checker (docs/js/spell.js) runs in the demo before the readers and is not run here (SPELL=0, as in the earlier short-set reports).

## 9. Files (this folder)

- run.sh (collectors: Rules, VSS-G, SOP-BERT G on every set; records go to REC=<dir>), prep.py, prep_help.mjs (sets), analyze.mjs (statuses + confidences), tables.py (-> tables_out.md), rules_right.py (section 3 table),
  pick_cases.py, cases.mjs, lookup.py, classify_cases.py (-> cases_classified.json, cases_lookup.json, cases_view.txt: the 100 cases), conv_checks.py, train_stats.py (-> train_stats.json), role_desc.txt, help_stats.txt, data/ (the template and help sets as jsonl).
- The records (about 5000 messages x 3 readers) were written to the scratchpad, not to the repository; run.sh recreates them in about 15 minutes on 2 CPU cores. train_stats.py reads help_ex.json, a dump of HelpKit.examples() (this folder).
