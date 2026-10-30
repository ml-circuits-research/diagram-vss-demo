# Experiment: request boundaries found by the VSS reader itself (2026-10-31)

Hypothesis (owner's idea, "several centres of gravity"): every action word of a message is the centre of one VSS state; a word belongs
to the centre whose reading explains it (places it in a role); words no centre explains are chatter. Then the reader takes a whole
message and returns several formalizations, with no separate cutting model.

Measure: exact-span F1 against the annotated spans of held-out TRAINING messages (first 40 of the 20% dev split), existing model
final_p40, no training. Threshold fixed before: >= 0.85 (the learned tagger, the backup, has 0.92).

| how the message is cut | exact-span F1 |
|---|---|
| learned tagger (front.js, backup) | 0.92 |
| VSS centres (vss-centers.js) | 0.34 |
| VSS residual, first attempt (vss-segment.js) | 0.24 |

Result: below the threshold; stopped, no tuning.

Why (checks of the implementation, not tuning):
- On the gold spans themselves, the reader places every word in only 93 of 138 requests (67%): 44 readings abstain, 5 find no event.
  So "explained by a centre" is a weak signal with this model: it was trained to place role words, not to explain everything.
- The centres come from the learned trigger words: chatter fires some ("this IS my login flow" -> a centre), some actions are missed
  ("slide the Wing" -> no centre, merged into the previous request).

What matters more (same dev split, model final_p40, all requests):

| VSS fed with | wires right |
|---|---|
| the annotated spans (perfect cut) | 52.2% |
| the learned tagger's cut | 50.4% |
| (rules, for reference) | 69.7% |

The cut costs VSS about 2 points; the gap to the rules (~17-19 points) is in READING the requests, not in finding them.

## Follow-up (owner allowed small adjustments), end to end on the same dev split (1126 requests), model final_p40

| VSS fed with | wires right | extra wires (not asked for) |
|---|---|---|
| annotated spans (perfect cut) | 52.2% | 80 |
| learned tagger's cut | 50.4% | 90 |
| VSS centres, only content words scored (names, values, numbers, action words) | 41.7% | 290 |
| same, centres whose reading abstains dropped | 38.5% | 289 |

The centres find slightly more requests (act found 83.7% vs 80.8%) but chatter becomes centres (about 200 extra commands).
Why it worked elsewhere: WikiSQL and SNIPS have ONE request per input (one question -> one query), so one centre was always enough;
the several-centres reading was never tested there.
