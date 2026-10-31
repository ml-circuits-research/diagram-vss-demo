# Why VSS misreads perfectly cut requests (2026-10-31)

Setup: the 253 held-out TRAINING messages (20% dev split, corrected labels), 1126 gold requests, each read ALONE from its annotated
span (no cut errors). Model final_p40 (learned front end, trained before the label fixes, thresholds calibrated in-sample). Scoring
as llm_score.mjs. Script: error_analysis.mjs. No training, no tuning.

Fully right: 605 / 1126 = 53.7%. Reader status: ok 658, abstain 344, unknown-event 93, no-sense 31.

| cause of the miss | % of all requests | where the cause sits |
|---|---|---|
| a list role (several shapes) filled where the gold has one shape: "connect Bias to Hidden" -> from Bias AND Hidden | 10.1 | our set-role port: member thresholds |
| action word not recognized (verbless or fronted openings: "the X ...", "are X and Y connected", "slide") | 9.3 | front end: learned triggers |
| role missed (reference shape 38, colour 20, position 15, other 20) | 8.5 | presence thresholds (calibrated in-sample) / model |
| wrong action or type ("Is Paused a circle" read as a fact; "what is next to X" neighbors vs list) | 7.2 | model / label conventions |
| name not reachable (pronouns, "$new", context) | 4.4 | front end / reasoning context |
| value not reachable ("bottom left corner", "oval", "every" -> all) | 2.4 + 0.6 | front end: learned values |
| reader refuses (no-sense) | 1.7 | model |
| source/target swapped, other role errors | ~2 | model |

Words without a kind of their own (read as `unknown`): 3.1% of the words in right requests, 7.2% in wrong ones. The kinds compress
little information here: spans are short and their words mostly have kinds; most misses are not kind collisions.

Reading: about 30 of the ~46 missing points sit in our pipeline (list-role thresholds, triggers, values, calibration), not in the VSS
core. They are fixable with the protocol already prepared (held-out calibration) and with the learned front end; the rest (~15 points:
wrong type, refusals, swaps, part of the missed roles) is the model.

## Fixes verified without retraining (same model, same 1126 requests)

| change | fully right |
|---|---|
| before | 53.7% |
| a set role (list) is first judged present by its own presence threshold, as every other role (infer.py and reader.js; before, one member above the member threshold made the list "present", so "connect Bias to Hidden" also filled the list with both names) | 54.4% |
| a list's members ordered by their position in the text (a VSS set is unordered; "arrange C, G and D" came back as C, D, G) | 55.4% |

What is left in "role wrong" (113): lists still misread by the model (the first member of a chain missed; "connect Hub to Lamp and
Sensor" filling both the source list and the target list: 92), source and target swapped on "disconnect A from B", self-corrections.
These, the action words not recognized (front end), the values not reachable (front end) and the missed roles (thresholds calibrated
in-sample) need a rebuild and a retraining with the corrected labels and the held-out calibration.
