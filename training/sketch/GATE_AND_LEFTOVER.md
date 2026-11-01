# Words not understood, cross-world pick, and worlds in the cutter

Scripts (all new, nothing existing changed): `words_not_understood.mjs` (M1, M1b; copies the scoring of `composer_errors.mjs`), `wnu_stats.py` (statistics),
`gate_export.mjs` + `gate_probe.py` (the separate linear gate, kept as a quick comparison), `cutter_worlds_probe.py` (M2: worlds inside the cutter).
Raw outputs: `wnu_output.txt`, `gate_probe_output_{toks,raw}_id.txt`, `cutter_worlds_probe_output.txt`.
Sample: 1000 messages of the 4640 (seeded shuffle, seed 1, mulberry32) of the 9 folders; 95% intervals: Wilson for shares, bootstrap over messages for AUC and ratios.
Words of a unit = its surface tokens without punctuation (a name, a quoted text, a number each count as one word). Understood = surface words behind
the filler words of the frame's roles, the adapter's accepted offers, or the action token (the normalization is replayed with source positions; it
reproduced the front end's tokens for all 4089 readings). The "function words ignored" variant drops the/a/an/to/of/and/please from words and from not-understood.

Caveats. (1) The sample has 4089 produced actions (right 3006, wrong 778, extra 305); the full-data margin results of COMPOSER_ERRORS.md section 6 are on
13.7k right: on this sample abstain loses 190 right (6.3%) to avoid 130 wrong (16.7%) and 49 extra (16.1%), the same proportions as the full data (6.0 / 15.7 / 15.4%), so the
sample is representative. (2) M1b is a lower bound: the worlds were trained WITH the trigger rules. (3) In M1b the units are the gold spans, not the cutter's.
(4) Ties by registry order are the spec; the 45 units where no world understands any word (9.0%) are decided by registry order alone ("create" is first), which is the main reason "create" wins wrongly.

## Findings in short
- M1: the share of words not understood is a weak signal: AUC 0.642 (CI 0.622-0.661) for right vs wrong+extra; it separates extras well (AUC 0.787) and wrong readings barely (0.585). The reader's margin has AUC 0.514, i.e. none. As a stop rule it costs more right readings per error avoided than abstain: abstain 1.06 right lost per wrong-or-extra avoided; share >= 0.5: 1.08 (equal), share >= 0.6: 0.75 (better, but avoids only 14% of wrong); share >= 0.4: 1.47. At t = 0.5 it avoids 69% of extras and 32% of wrong for 17% of right.
- M1b: picking the world with the fewest words not understood finds the gold request's world in 78.2% (CI 74.4-81.6) of 500 units (85.9% when some world understands something); gold world is among tied winners in 88.4%; a tie of 2+ worlds happens in 59.4%.
- M2 (owner's version): B-<world> labels in the cutter give the gold world at rank 1 in 90.4% (all) / 86.2% (verbless), rank 3 in 97.9% / 95.8%, and cost about 1.2 points of exact cuts (87.2% -> 86.0%) and 1.5 points more missed requests (3.1% -> 4.6%); verbless requests suffer most (missed 12.6% -> 15.6%).

# M1 and M1b (words_not_understood.mjs, wnu_stats.py)
readings (produced actions, current routing): 4089 from 1000 messages; right 3006, wrong 778, extra 305

## Distribution (words not understood, share = not understood / words of the unit)

all surface words
| kind | n | count median [Q1,Q3] | share median [Q1,Q3] | share = 0 |
|---|---|---|---|---|
| right | 3006 | 2 [1,3] | 0.29 [0.17,0.40] | 567 (18.9%, CI 17.5-20.3) |
| wrong | 778 | 2 [1,3] | 0.36 [0.20,0.50] | 151 (19.4%, CI 16.8-22.3) |
| extra | 305 | 3 [2,4] | 0.60 [0.33,0.67] | 27 (8.9%, CI 6.2-12.6) |

function words the/a/an/to/of/and/please ignored
| kind | n | count median [Q1,Q3] | share median [Q1,Q3] | share = 0 |
|---|---|---|---|---|
| right | 3006 | 0 [0,1] | 0.00 [0.00,0.33] | 1565 (52.1%, CI 50.3-53.8) |
| wrong | 778 | 1 [0,2] | 0.20 [0.00,0.43] | 318 (40.9%, CI 37.5-44.4) |
| extra | 305 | 2 [1,3] | 0.50 [0.33,0.62] | 52 (17.0%, CI 13.2-21.7) |

## AUC of the share not understood (positive = wrong or extra, negative = right; 0.5 = no signal; bootstrap over messages, 500 resamples)
- share, all words: AUC 0.642 (CI 0.622-0.661)
- share, function words ignored: AUC 0.628 (CI 0.609-0.647)
- raw count of words not understood: AUC 0.626 (CI 0.607-0.646)
- for comparison, the reader's margin (small margin = suspect): AUC 0.514 (CI 0.492-0.534)
- share (all words), right vs wrong only: AUC 0.585; right vs extra only: AUC 0.787

## Trade-off: readings flagged and asked instead of executed (of right 3006, wrong 778, extra 305; Wilson CIs)
| rule | right lost | wrong avoided | extra avoided | right lost per (wrong+extra) avoided [bootstrap CI] |
|---|---|---|---|---|
| margin: abstain (status) | 190 (6.3%, CI 5.5-7.2) | 130 (16.7%, CI 14.3-19.5) | 49 (16.1%, CI 12.4-20.6) | 1.06 [0.88-1.32] |
| share >= 0.2 (all words) | 2192 (72.9%, CI 71.3-74.5) | 586 (75.3%, CI 72.2-78.2) | 275 (90.2%, CI 86.3-93.0) | 2.55 [2.36-2.80] |
| share >= 0.3 (all words) | 1374 (45.7%, CI 43.9-47.5) | 474 (60.9%, CI 57.5-64.3) | 254 (83.3%, CI 78.7-87.0) | 1.89 [1.72-2.10] |
| share >= 0.4 (all words) | 799 (26.6%, CI 25.0-28.2) | 321 (41.3%, CI 37.9-44.8) | 223 (73.1%, CI 67.9-77.8) | 1.47 [1.31-1.63] |
| share >= 0.5 (all words) | 501 (16.7%, CI 15.4-18.0) | 253 (32.5%, CI 29.3-35.9) | 210 (68.9%, CI 63.4-73.8) | 1.08 [0.94-1.22] |
| share >= 0.6 (all words) | 200 (6.7%, CI 5.8-7.6) | 109 (14.0%, CI 11.7-16.6) | 156 (51.1%, CI 45.6-56.7) | 0.75 [0.63-0.92] |
| share >= 0.2 (function words ignored) | 1148 (38.2%, CI 36.5-39.9) | 414 (53.2%, CI 49.7-56.7) | 252 (82.6%, CI 78.0-86.5) | 1.72 [1.56-1.91] |
| share >= 0.3 (function words ignored) | 796 (26.5%, CI 24.9-28.1) | 294 (37.8%, CI 34.4-41.2) | 238 (78.0%, CI 73.1-82.3) | 1.50 [1.34-1.68] |
| share >= 0.4 (function words ignored) | 642 (21.4%, CI 19.9-22.9) | 233 (29.9%, CI 26.8-33.3) | 196 (64.3%, CI 58.7-69.4) | 1.50 [1.33-1.70] |
| share >= 0.5 (function words ignored) | 455 (15.1%, CI 13.9-16.5) | 175 (22.5%, CI 19.7-25.6) | 174 (57.0%, CI 51.4-62.5) | 1.30 [1.15-1.50] |
| share >= 0.6 (function words ignored) | 227 (7.6%, CI 6.7-8.6) | 57 (7.3%, CI 5.7-9.4) | 96 (31.5%, CI 26.5-36.9) | 1.48 [1.22-1.79] |
| abstain OR share >= 0.4 | 897 (29.8%, CI 28.2-31.5) | 402 (51.7%, CI 48.2-55.2) | 226 (74.1%, CI 68.9-78.7) | 1.43 [1.30-1.59] |

Difference of the ratio (share >= 0.4 minus abstain): +0.41, bootstrap CI +0.15 to +0.63

## Share not understood by world of the reading (median; n)
- set: n 745, median share 0.25, right 79%
- move: n 544, median share 0.20, right 66%
- connect: n 536, median share 0.38, right 54%
- superlatives: n 339, median share 0.50, right 96%
- filters: n 303, median share 0.40, right 59%
- kinds_p80_s0: n 292, median share 0.33, right 86%
- facts: n 245, median share 0.25, right 53%
- graph: n 217, median share 0.25, right 91%
- describe: n 157, median share 0.33, right 96%
- create: n 154, median share 0.30, right 74%
- layout: n 143, median share 0.22, right 48%
- targets: n 129, median share 0.17, right 84%
- naming: n 114, median share 0.25, right 79%
- history: n 108, median share 0.50, right 95%
- resize: n 47, median share 0.33, right 77%
- disconnect: n 16, median share 0.25, right 88%

## Examples (share >= 0.5, kinds)
- [right] (superlatives/extreme) "Which shape is the smallest right now" not understood: ['which', 'is', 'right', 'now'] share 0.57
- [right] (history/undo) "Undo the last set" not understood: ['the', 'last', 'set'] share 0.75
- [right] (superlatives/nearest) "which client is farthest from it" not understood: ['which', 'client', 'is'] share 0.50
- [right] (superlatives/extreme) "what is the biggest thing on the plan" not understood: ['what', 'is', 'thing', 'on', 'the', 'plan'] share 0.75
- [wrong] (filters/count) "How many connections are there in the whole diagram" not understood: ['are', 'there', 'in', 'the', 'diagram'] share 0.56
- [wrong] (set/set) "Garage should be placed to the right of the House" not understood: ['placed', 'to', 'the', 'right', 'of', 'the'] share 0.60
- [wrong] (filters/count) "How many connections do we have" not understood: ['do', 'we', 'have'] share 0.50
- [wrong] (move/move) "Put the kids on the bottom" not understood: ['the', 'kids', 'on', 'the'] share 0.67
- [extra] (facts/fact) "Set every shape that is not white to purple" not understood: ['set', 'every', 'that', 'not', 'to', 'purple'] share 0.67
- [extra] (kinds_p80_s0/check) "Is Lockers touching Desk6" not understood: ['touching', 'n_desk6'] share 0.50
- [extra] (connect/connect) "Undo the last connect" not understood: ['undo', 'the'] share 0.50
- [extra] (set/set) "Make the Idle to Run link two-way" not understood: ['the', 'to', 'link', 'two-way'] share 0.57

## M1b: every world reads the gold unit, fewest words not understood wins (ties: registry order, fallback last)
units 500; picked world = gold request's world (registry-order tie break): 391 (78.2%, CI 74.4-81.6)
gold world among the tied winners (optimistic tie break): 442 (88.4%, CI 85.3-90.9)
tie of 2+ worlds at the minimum: 297 (59.4%, CI 55.0-63.6)
mean number of worlds tied at the minimum when a tie: 4.1
units where NO world understood any word (minimum = all words; the pick is then just the first world of the registry): 45 (9.0%, CI 6.8-11.8); of the 109 wrong picks, 45 are such units
accuracy on the other units: 391 (85.9%, CI 82.4-88.8)

gold world -> accuracy:
- connect: 74/95
- set: 61/82
- move: 52/71
- superlatives: 36/42
- filters: 24/32
- kinds_p80_s0: 25/28
- targets: 22/24
- graph: 22/24
- facts: 10/21
- layout: 13/18
- create: 12/15
- describe: 11/14
- history: 13/14
- naming: 10/12
- resize: 6/7
- disconnect: 0/1

worlds that win wrongly most often:
- create: 47 wrong wins
- kinds_p80_s0: 41 wrong wins
- facts: 8 wrong wins
- set: 4 wrong wins
- move: 3 wrong wins
- filters: 3 wrong wins
- graph: 2 wrong wins
- describe: 1 wrong wins

top confusions (gold world -> picked): set->create 16; move->kinds_p80_s0 13; connect->create 12; connect->kinds_p80_s0 7; move->create 6; facts->kinds_p80_s0 5; superlatives->facts 4; filters->create 4

examples (5 per top wrongly winning world; bracket = words the winner did not understand):

create:
- "What are the stars" gold list (filters) -> create [what, are, the, stars] ties 16
- "left of it" gold check (kinds_p80_s0) -> create [left, of, it] ties 16
- "the Youth a small lime star" gold fact (facts) -> create [the, n_youth, a, small, lime, star] ties 16
- "Does Founder have three connections" gold degree (describe) -> create [does, n_founder, have, three, connections] ties 16
- "the Winger blue" gold set (set) -> create [the, n_winger, blue] ties 16

kinds_p80_s0:
- "move Cfo to the right of Cto" gold move (move) -> kinds_p80_s0 [of] ties 1
- "Garlic is white, Onion is white as well" gold fact (facts) -> kinds_p80_s0 [as, well] ties 1
- "Sugar, Butter and Egg all feed Batter, so connect them" gold connect (connect) -> kinds_p80_s0 [and, all, feed, so] ties 1
- "Tell me the rules" gold list (filters) -> kinds_p80_s0 [tell, me, the] ties 1
- "An Alert fires, an Analyst picks it up, and a Case is opened. Link them as a chain" gold connect (connect) -> kinds_p80_s0 [an, fires, an, picks, up, and, a, n_case, opened, as, a, chain] ties 1

facts:
- "The Database is the crown jewel, so a gold star would be perfect. Change it" gold set (set) -> facts [the, the, crown, jewel, so, a, would, be, perfect, change] ties 1
- "Is the Ceo the topmost" gold extreme (superlatives) -> facts [the, the, topmost] ties 3
- "what is the farthest one from the Coaster" gold nearest (superlatives) -> facts [what, the, farthest, one, from, the] ties 3
- "Alice is blue" gold set (set) -> facts [] ties 2
- "Is Exit the bottommost" gold extreme (superlatives) -> facts [the, bottommost] ties 3

set:
- "new squares should be white" gold rule (facts) -> set [] ties 1
- "Reds should be red" gold fact (facts) -> set [] ties 2
- "Make the Shed smaller" gold resize (resize) -> set [the] ties 2
- "Reds, Blues, Greens and Yellows should be in a grid" gold arrange (layout) -> set [and, in, a, grid] ties 2

# M2a: worlds inside the cutter (cutter_worlds_probe.py)
Variants: base = B I O, the cutter's own features, trained here on the 80% (the shipped cutter was trained on all data); worlds = B-<world> I O; worlds+pw = plus features of the world of the previous unit (most recent B label). Greedy decoding, 8 epochs (front_params.json), averaged perceptron. Gold labels use the k-th occurrence of a repeated span (the trainer of front.py uses the first), same for all variants. Split by md5 of the message id (message ids repeated across folders go to the same side). "Free" recall is at the gold request's first token even if the decode missed the request.
Reading: ranking is good (a linear model on the first token and its neighbours), the previous world helps verbless requests (86.2 -> 87.9 free, 86.6 -> 89.9 forced; CIs overlap in free mode), and the cut gets slightly worse because 16 B labels split the B evidence (more missed requests, fewer spurious units: 254 -> 190 units with no gold request).

# cutter_worlds_probe: train 3668 messages, test 972 messages (4685 gold requests; verbless 672); 95% Wilson intervals

## (b) Cut quality on the test 20%, free greedy decode (gold requests; units of the cutter)
| cutter | exact | one unit, not exact | missed | merged | split | units with no gold request / units |
|---|---|---|---|---|---|---|
| base | 87.2% (86.2-88.2) [4087] | 5.7% (5.1-6.4) [269] | 3.1% (2.6-3.6) [145] | 2.4% (2.0-2.9) [114] | 1.5% (1.2-1.9) [70] | 254 / 4811 |
| worlds | 86.0% (85.0-87.0) [4029] | 5.8% (5.2-6.5) [271] | 4.6% (4.0-5.2) [216] | 2.4% (2.0-2.9) [112] | 1.2% (0.9-1.6) [57] | 190 / 4662 |
| worlds+pw | 86.4% (85.4-87.3) [4047] | 5.4% (4.8-6.1) [254] | 5.1% (4.5-5.8) [239] | 1.7% (1.4-2.1) [81] | 1.4% (1.1-1.7) [64] | 185 / 4657 |
(n = 4685 gold requests)

Verbless gold requests only:
| cutter | exact | one unit, not exact | missed | merged | split |
|---|---|---|---|---|---|
| base | 71.9% (68.4-75.1) [483] | 7.7% (5.9-10.0) [52] | 12.6% (10.3-15.4) [85] | 6.0% (4.4-8.0) [40] | 1.8% (1.0-3.1) [12] |
| worlds | 67.7% (64.1-71.1) [455] | 9.4% (7.4-11.8) [63] | 15.6% (13.1-18.6) [105] | 6.2% (4.7-8.3) [42] | 1.0% (0.5-2.1) [7] |
| worlds+pw | 68.2% (64.5-71.6) [458] | 8.0% (6.2-10.3) [54] | 17.9% (15.1-20.9) [120] | 4.5% (3.1-6.3) [30] | 1.5% (0.8-2.7) [10] |

## (a) Rank of the gold world among the B-<world> scores at the gold request's first token

forced context (previous label / previous unit world = gold)
| cutter | requests | recall@1 | recall@2 | recall@3 |
|---|---|---|---|---|
| worlds | all (4685) | 90.5% (89.7-91.3) | 96.6% (96.1-97.1) | 97.9% (97.5-98.3) |
| worlds | verbless (672) | 86.6% (83.8-89.0) | 93.9% (91.8-95.5) | 96.0% (94.2-97.2) |
| worlds | with action token (4013) | 91.2% (90.3-92.0) | 97.1% (96.5-97.6) | 98.3% (97.8-98.6) |
| worlds+pw | all (4685) | 91.2% (90.3-92.0) | 96.6% (96.0-97.0) | 98.2% (97.8-98.5) |
| worlds+pw | verbless (672) | 89.9% (87.4-91.9) | 94.8% (92.8-96.2) | 97.0% (95.4-98.1) |
| worlds+pw | with action token (4013) | 91.4% (90.5-92.2) | 96.9% (96.3-97.4) | 98.4% (98.0-98.7) |

free context (previous labels as the greedy decode produced them)
| cutter | requests | recall@1 | recall@2 | recall@3 |
|---|---|---|---|---|
| worlds | all (4685) | 90.4% (89.5-91.2) | 96.6% (96.0-97.1) | 97.9% (97.4-98.3) |
| worlds | verbless (672) | 86.2% (83.3-88.6) | 93.8% (91.7-95.3) | 95.8% (94.0-97.1) |
| worlds | with action token (4013) | 91.1% (90.2-91.9) | 97.1% (96.5-97.5) | 98.2% (97.8-98.6) |
| worlds+pw | all (4685) | 90.6% (89.7-91.4) | 96.2% (95.7-96.8) | 98.0% (97.5-98.3) |
| worlds+pw | verbless (672) | 87.9% (85.3-90.2) | 93.8% (91.7-95.3) | 96.7% (95.1-97.8) |
| worlds+pw | with action token (4013) | 91.0% (90.1-91.9) | 96.7% (96.1-97.2) | 98.2% (97.7-98.5) |

end to end (worlds): the free decode labels the gold first token exactly B-<gold world>: 85.0% (84.0-86.0) of 4685

end to end (worlds+pw): the free decode labels the gold first token exactly B-<gold world>: 85.4% (84.3-86.4) of 4685

# M2b: the separate linear gate on the gold span (quick comparison; gate_probe.py, logistic regression on word unigrams+bigrams, 18015 train / 4687 test requests)
It sees the whole gold span (no cutting errors), so it is an upper bound for the cutter's ranking: recall@1 97.8% with front-end tokens, 98.1% with surface words only (no trigger rules; so the gate does not need the front end), verbless 96.7% (with previous world) vs 94.6-94.8% without it. Output with surface words:

tokens: raw
requests 22702: train 18015 (3664 message ids), test 4687 (971 ids); split by hash of the id; message ids in both: 0
test requests whose exact span text also occurs in train: 591 of 4687
gold worlds in test: set 884, connect 722, move 609, superlatives 349, filters 294, graph 272, fallback 238, describe 222, create 210, targets 176, facts 171, layout 167, history 140, naming 129, resize 69, disconnect 35
features: 4461 unigrams+bigrams (document frequency >= 2 in train) + previous-world one-hot (17); L2 0.0001
verbless requests in test: 672 of 4687 (14.3%); in all data 3161 of 22702

### all test requests (n = 4687)
| model | recall@1 | recall@2 | recall@3 |
|---|---|---|---|
| with previous world | 98.1% (97.7-98.5) | 99.6% (99.4-99.7) | 99.8% (99.6-99.9) |
| without previous world | 97.7% (97.2-98.1) | 99.4% (99.1-99.6) | 99.7% (99.5-99.8) |
| previous world only | 29.2% (27.9-30.5) | 43.9% (42.5-45.3) | 52.9% (51.5-54.3) |
| majority world | 18.9% (17.8-20.0) | 34.3% (32.9-35.6) | 47.3% (45.8-48.7) |

### verbless requests (no action token) (n = 672)
| model | recall@1 | recall@2 | recall@3 |
|---|---|---|---|
| with previous world | 96.7% (95.1-97.8) | 98.7% (97.5-99.3) | 99.4% (98.5-99.8) |
| without previous world | 94.8% (92.8-96.2) | 97.9% (96.5-98.8) | 98.7% (97.5-99.3) |
| previous world only | 52.1% (48.3-55.8) | 65.6% (62.0-69.1) | 69.9% (66.4-73.3) |
| majority world | 29.9% (26.6-33.5) | 55.1% (51.3-58.8) | 68.9% (65.3-72.3) |

### requests with an action token (n = 4015)
| model | recall@1 | recall@2 | recall@3 |
|---|---|---|---|
| with previous world | 98.3% (97.9-98.7) | 99.8% (99.5-99.9) | 99.9% (99.7-99.9) |
| without previous world | 98.2% (97.7-98.5) | 99.7% (99.4-99.8) | 99.9% (99.7-99.9) |
| previous world only | 25.3% (24.0-26.7) | 40.2% (38.7-41.8) | 50.1% (48.5-51.6) |
| majority world | 17.0% (15.9-18.2) | 30.8% (29.4-32.2) | 43.6% (42.1-45.2) |

Paired bootstrap over test messages (500 resamples): recall with minus without the previous world
- all, recall@1: +0.4 points (CI +0.1 to +0.7)
- all, recall@2: +0.2 points (CI +0.0 to +0.4)
- all, recall@3: +0.1 points (CI +0.0 to +0.2)
- verbless, recall@1: +1.9 points (CI +0.5 to +3.7)
- verbless, recall@2: +0.7 points (CI -0.2 to +1.7)
- verbless, recall@3: +0.7 points (CI +0.1 to +1.6)
