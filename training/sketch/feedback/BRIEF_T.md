# Brief for the targeted training data (T) of FEEDBACK_PLAN.md: section 4 of DATA_NEEDS.md, extracted unchanged for the writers

## 4. Brief for the data writer: the top 30 needs of the new writer (calibration part)

Ranked by requests, as the tool gives them. Each line says which construction and which action to write data for; the wording is
deliberately general (placeholders A, B, C for names) so that new data does not copy the evaluation text. Every need asks for whole
realistic messages (llm_train/TRAIN_MSG_SPEC.md), not isolated lines. Causes marked * were specific to failures in 2.2; the others are broad
doubts.

| # | data to write (action · construction) | requests (cause) |
|---|---|---|
| 1 | connect, every form, source and target both stated: from A to B, A to B, one source to several targets, chains; with and without a style or arrow head | 80 (prior: the links world) |
| 2 | create: article, optional count / size / colour, a shape noun (singular and plural), a naming phrase (called / named + name), then a position relative to another shape | 37 (residual) |
| 3 | sentences of the form "A is ..." between requests: annotate which are requests (a fact, a colour, a position) and which are comments | 28 (cut-missed*) |
| 4 | count questions: how many shapes / arrows of a kind, with "are there", "do we have", "in total", "now" | 22 (prior: questions) |
| 5 | connect with lists: one source to two or three targets, three names in a chain, two sources to one target | 21 (residual) |
| 6 | connect where the linking words belong to the request: from / to / and / with a style | 20 (words left) |
| 7 | set in statement form: "A should be <colour / shape>", "there should be N ..." | 16 (cut-missed*) |
| 8 | extreme questions: the biggest / smallest / leftmost / bottommost shape of a kind | 14 (prior: questions) |
| 9 | move with several shapes at once, region words (a corner, a grid row) and the statement form "A should sit below B" | 14 (residual) |
| 10 | list questions: which shapes have / do not have a colour or shape | 13 (prior: questions) |
| 11 | spans of set requests that start with "make" right after a sentence end or a comma | 12 (cut start) |
| 12 | property questions: what colour / shape / label A has | 12 (prior: questions) |
| 13 | sentences with "after" (order comments, "not after"): annotate whether they are requests; the links front end reads them as connect | 11 (cut-missed*) |
| 14 | create with a naming phrase and an "at <position>" phrase | 11 (words left) |
| 15 | set with a relative change (a bit bigger), a quantified target (all the circles) or a change of shape | 10 (residual) |
| 16 | connect with three or more names, each in its role: one to many, "between A and B", pairs | 10 (unplaced*) |
| 17 | count questions with "are there", "now", "in <a region>" | 10 (words left) |
| 18 | set requests (colour, shape) that open with "make" / "put" or with a subject and "should be": spans labelled for the shapes world | 10 (world close) |
| 19 | self-corrections ("wait, no ...", "no, actually leave ..."): annotate what they cancel or keep; the links front end reads them as connect | 10 (cut-missed*) |
| 20 | set with "it" as the target, the shape named earlier in the message | 10 (context) |
| 21 | sentences "A and B are ...": annotate request or comment | 9 (cut-missed*) |
| 22 | set in desire form: "I want all <group> <value>", "I want to ..." | 9 (cut-missed*) |
| 23 | nearest questions: which shape is closest / farthest from A | 9 (prior: questions) |
| 24 | count questions with extra clauses (how many did that make, how many are <colour> in total) | 9 (residual) |
| 25 | create requests that open with "add": spans labelled for the shapes world, not links | 9 (world close) |
| 26 | spans of create requests that start with "add" after "please" or "then" | 9 (cut start) |
| 27 | move whose moved shape is not said in the request (it is clear from earlier in the message) | 8 (ask*) |
| 28 | neighbors questions: what is connected to A, A's neighbours | 8 (prior: questions) |
| 29 | extreme questions in yes / no form: is A the rightmost / topmost shape | 8 (residual) |
| 30 | extreme questions with "has the most <links>", "is the smallest now" | 8 (words left) |

Specific needs below the top 30 that FRESH2_CAUSES.md also found:
- ask for "them" in set / connect / move / swap (6 + 3 + 3 + 2);
- "labelled" in create / connect / property;
- typos of colour, shape and direction words;
- "same <size / colour> as";
- delete forms the cutter leaves out.

