# Attention for VSS constellations on a synthetic world: implementer A

Plan: `research/attention/PLAN.md` (including the two added requirements: linear cost, chatter zones handed back).
Code (all in this folder): `world.py` (synthetic world), `minivss.py` (mini-VSS: standard reader + centre-relative reader),
`exp.py` (E0, E1, E2), `bench.py` (cost on one long message). Raw numbers: `results/*.json`.

## Set-up (fixed before any recorded run)

World (`world.py`):
- 5 events, 15 action words (create: draw / add / create; connect: connect / link; move: move / put / place; set: paint / make / colour;
  delete: delete / remove / erase), 60 names (45 in training, 15 only in test), 8 colours, 6 shapes, 5 relations, 14 function words,
  47 chatter words. Roles: create(shape, color (optional, 60%), name), connect(source, target), move(object, relation, landmark),
  set(object, color), delete(object).
- Surface forms: 2-4 per event, optional "the"; 15% of connect / set / delete requests have their fillers BEFORE the action word
  ("Kasu , delete it", "Kasu and Lolo , link them"), so a centre must collect words on both sides.
- Message: 1-n requests joined by "," / "and" / "then" / "." / nothing / ", then" / "and then"; 0-2 chatter phrases before, between
  or after. A chatter phrase contains an action word used non-actively ("this is a draw of the map") with probability 0.3 (a FALSE
  CENTRE), or else a name with probability 0.25 ("i think Kasu is good": a name candidate that belongs to no request).
- Kinds (reader input): the event of an action word (V_create, ...), NAME, COLOR, SHAPE, REL, one kind per function word, CHAT.
  Kinds come from the training lexicon; an unseen word is NAME if capitalized, else UNK.
- Splits per seed: train 6000 messages (1-3 requests), dev 600 (same), test 1200 (1-4 requests, all 60 names). Test messages with 4
  requests and requests with unseen names measure generalization (the E4 axes, reported but not a pass/fail here).

Mini-VSS (`minivss.py`), D = 256, complex phases, as the real reader:
- stars: fixed random phase vectors per word (hash of the word), per role key and the predicate key; never learned;
- target of a request: R_pred x f_action + sum_r R_r x f_filler; objective max cos(state, target), Adam lr 0.02, 3 epochs;
- standard reader (Std, E0): term_k = sigmoid(gate[kind_k]) x (exp(i cumsum path[kind]) + exp(i bigram[kind_{k-1}, kind_k])) x f_k;
- centre-relative reader (Rel, E1 / E2): one state per centre (every action-kind token). LINEAR design: each token is attached to at
  most R = 2 nearest centres on each side; its address relative to centre c restarts at c and runs outwards
  (phase = A[side, kind_c] + sum over the tokens between c and it of w x th[side, kind], computed from prefix sums of weighted kind
  counts: T x R x K numbers), plus a directional bigram code with the neighbour on the centre's side; the centre itself at P[kind_c].
  S_c = sum_i w_ic gate[kind_i] addr_ic f_i, one D-vector per centre.
  E1: w = gold (1 if the token belongs to c's request). E2: w = sigmoid(U[side, kind_i, kind_c] + V[side, kind_i, distance bucket]
  + W[side, kind_i, rank] - sum of a learned barrier per kind over the tokens between + b), rank - 1 = the number of other centres in
  between; the learned barrier replaces a hand-written "separators" list.
- readout: unbind the predicate key, best action word among the candidates -> event; for each role of that event unbind its key,
  best candidate among the words of the role's kinds; the optional role is present when best cos / structure score (mean best cos of
  the predicate and the required roles) >= a threshold chosen on dev. Candidates: the input's words (E0: the span / the message /
  the stretch; E1, E2: the centre's attachment window).

Measures (test, read once): request exact accuracy (event + every role right; outputs matched one to one to gold requests),
extra requests per 100 gold requests (outputs beyond the number of gold requests in the message), by number of requests and by chatter
level (phrases per message). Zones (second added requirement): the tokens attached to no output request, as maximal runs, edges
trimmed of "," "." "and" "then" (an evaluation convention, the same for gold and prediction); exact-span F1 against the gold chatter
zones, and token F1 of chatter tokens (separators excluded). Two zone rules are reported where they apply: (z) the method's own
assignment (E0c: the chosen stretches; E2: weight > 0.5 to an output centre) and (z2) the span from the first to the last word the
reading placed (filler or predicate).
Seeds: 2 (0 and 1) for every number; world, stars, init change with the seed.

## Pre-registered hypotheses and thresholds (written before the runs)

- E0a (gold cut + standard reader): sanity, must reach >= 90% on test, else the mini-VSS is fixed first (not a result).
  Extras are 0 by construction (one reading per gold span).
- E0b (no cut, one state per message, a reader trained on whole one-request messages with chatter): baseline, no threshold.
  Expected about 1 / (number of requests) of the requests.
- E0c (today's hard centres, the dynamic programme of docs/js/vss-centers.js with the E0a reader): baseline, no threshold.
- E1 (centre-relative addresses, GOLD assignment): PASS if test accuracy >= E0a - 2 points (mean over seeds).
- E2 (learned soft attention, linear): PASS if test accuracy >= E0a - 5 points AND extras <= 2 x E0a extras. Since E0a has 0 extras by
  construction, the second condition means: no extra request at all. E2 has no mechanism to reject false centres (that is E3), so
  this condition is expected to fail whenever chatter contains action words; the accuracy condition is the informative one.
  Extras are also reported at chatter level 0 (no false centres possible).
- Zones (E0c, E2): no threshold in the plan; reported descriptively.
- Linear cost (E2 reader on one message of 10 ... 100 000 tokens): PASS if from 1 000 to 100 000 tokens the time and the peak memory
  grow by a factor between 50 and 200 (linear = 100).

## Results

Machine note: implementer B ran its own jobs on the same 2 cores during some of these runs; this changes times, not numbers.

### E0: baselines (`python exp.py --exp e0 --seeds 0 1`)

Columns: all test requests; by number of requests in the message (4 never seen in training); by chatter phrases per message.
Cells: mean over seeds 0 and 1 (each seed in brackets). Presence thresholds chosen on dev: E0a 0.434 / 0.427, E0b 0.388 / 0.320.


E0a (mean over seeds, per seed in brackets)

| measure | all | req1 | req2 | req3 | req4 | chat0 | chat1 | chat2 |
|---|---|---|---|---|---|---|---|---|
| accuracy % | 99.4 (99.2 / 99.5) | 99.2 (99.3 / 99.0) | 99.7 (99.8 / 99.7) | 99.2 (99.0 / 99.4) | 99.3 (99.2 / 99.5) | 99.3 (99.1 / 99.5) | 99.6 (99.6 / 99.6) | 99.2 (99.0 / 99.3) |
| extras / 100 req | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) |
| acc. reqs with unseen name % | 99.2 (99.1 / 99.4) | 98.4 (98.9 / 98.0) | 99.8 (100.0 / 99.5) | 99.3 (98.9 / 99.7) | 99.1 (98.9 / 99.4) | 99.2 (99.1 / 99.4) | 99.5 (99.4 / 99.7) | 98.9 (98.8 / 99.0) |

E0b (mean over seeds, per seed in brackets)

| measure | all | req1 | req2 | req3 | req4 | chat0 | chat1 | chat2 |
|---|---|---|---|---|---|---|---|---|
| accuracy % | 32.9 (32.3 / 33.5) | 97.2 (97.3 / 97.1) | 42.9 (42.3 / 43.6) | 25.8 (26.0 / 25.7) | 16.8 (17.1 / 16.5) | 34.7 (33.6 / 35.8) | 32.4 (31.2 / 33.6) | 31.6 (32.1 / 31.2) |
| extras / 100 req | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) | 0.0 (0.0 / 0.0) |
| acc. reqs with unseen name % | 32.8 (30.5 / 35.1) | 95.7 (95.5 / 96.0) | 44.7 (42.5 / 47.0) | 25.3 (25.4 / 25.2) | 17.1 (16.3 / 17.9) | 36.4 (32.9 / 39.9) | 32.4 (32.2 / 32.6) | 29.3 (26.3 / 32.2) |

E0c (mean over seeds, per seed in brackets)

| measure | all | req1 | req2 | req3 | req4 | chat0 | chat1 | chat2 |
|---|---|---|---|---|---|---|---|---|
| accuracy % | 89.3 (89.5 / 89.0) | 90.6 (91.4 / 89.8) | 89.6 (90.7 / 88.6) | 88.7 (88.6 / 88.9) | 89.2 (89.3 / 89.1) | 95.4 (95.9 / 94.9) | 88.8 (88.8 / 88.7) | 83.8 (84.3 / 83.3) |
| extras / 100 req | 9.3 (9.4 / 9.2) | 20.9 (22.6 / 19.2) | 12.3 (11.8 / 12.7) | 7.8 (7.7 / 7.9) | 6.0 (6.4 / 5.6) | 0.0 (0.0 / 0.0) | 8.7 (9.4 / 8.0) | 18.9 (18.2 / 19.5) |
| acc. reqs with unseen name % | 88.8 (88.3 / 89.3) | 89.8 (88.6 / 91.0) | 90.3 (91.1 / 89.5) | 87.8 (86.6 / 89.0) | 88.6 (88.2 / 89.0) | 95.4 (96.0 / 94.8) | 88.4 (87.5 / 89.4) | 82.3 (81.7 / 82.9) |
| zone span F1 (z) x100 | 44.2 (44.6 / 43.8) | 51.5 (49.3 / 53.7) | 45.8 (49.6 / 42.1) | 39.5 (40.7 / 38.4) | 40.4 (39.8 / 41.0) | 0.0 (0.0 / 0.0) | 47.7 (45.9 / 49.4) | 43.5 (45.3 / 41.6) |
| chatter token F1 (z) x100 | 62.8 (63.8 / 61.8) | 70.7 (70.5 / 70.9) | 64.2 (66.9 / 61.4) | 60.9 (63.5 / 58.3) | 54.6 (53.6 / 55.5) | 0.0 (0.0 / 0.0) | 63.7 (63.9 / 63.4) | 62.9 (64.3 / 61.5) |
| zone span F1 (z2) x100 | 48.6 (48.8 / 48.5) | 57.3 (56.0 / 58.6) | 49.4 (53.1 / 45.7) | 46.3 (47.5 / 45.2) | 43.6 (41.1 / 46.1) | 0.0 (0.0 / 0.0) | 52.1 (49.5 / 54.7) | 49.7 (51.7 / 47.7) |
| chatter token F1 (z2) x100 | 84.3 (84.7 / 83.9) | 89.8 (91.2 / 88.5) | 85.7 (86.9 / 84.5) | 83.1 (83.1 / 83.1) | 78.5 (77.8 / 79.3) | 0.0 (0.0 / 0.0) | 84.5 (84.4 / 84.6) | 85.7 (86.5 / 84.9) |

- E0a (gold cut): 99.4%, sanity threshold (>= 90%) met. Dev 99.2 / 99.7%. The few errors: the optional colour's presence decision.
  The synthetic world is clean: once a request is cut out, its kinds nearly determine every role (one SHAPE, one COLOR per span),
  so the gold-cut reader is near the ceiling. This is much easier than the real messages (52% with a gold cut there).
- E0b (one state for the whole message): 32.9%: 97% of one-request messages, 43 / 26 / 17% with 2 / 3 / 4 requests, i.e. about one
  request per message, as expected. One state reads one request.
- E0c (today's hard centres, dynamic programme over stretches): 89.3%, 9.3 extra requests per 100. With no chatter it reads 95.4%
  (it sometimes cuts a stretch wrongly even without chatter); with 2 chatter phrases 83.8%. Every extra request comes from a false
  centre (an action word inside chatter): the extras are 0 at chatter level 0 and equal the number of false centres elsewhere.
  Zones: span F1 0.44 (stretches) / 0.49 (placed spans), chatter token F1 0.63 / 0.84. A false centre takes its chatter phrase as a
  request, so that zone is lost.

### E1: centre-relative addresses with the GOLD assignment (`--exp e1`)

Hypothesis: addressing the words of a request relative to its centre (path restarting at the action word, outwards in both
directions, bounded attachment R = 2 per side, readout candidates = the centre's window, which contains other requests' words) reads as
well as the gold cut. Threshold: >= E0a - 2 points = 97.4%.


| measure | all | req1 | req2 | req3 | req4 | chat0 | chat1 | chat2 |
|---|---|---|---|---|---|---|---|---|
| accuracy % | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) |

Result: 100.0% on both seeds (dev 100%). PASS. Relative addresses lose nothing; the fronted forms ("Kasu , delete it", words on the
left of their centre) are read as well as the others, and the other requests' names in the window are never picked.

### E2: learned soft attention, linear (`--exp e2`)

Hypothesis: with w_ic = sigmoid(kind of word, kind of centre, distance bucket, rank, learned barrier) trained end to end from the
per-request targets only, every centre reads its request. Threshold: accuracy >= E0a - 5 = 94.4% AND extras <= 2 x E0a = 0.
Presence threshold on dev: 0.508 / 0.517.


| measure | all | req1 | req2 | req3 | req4 | chat0 | chat1 | chat2 |
|---|---|---|---|---|---|---|---|---|
| accuracy % | 99.8 (99.7 / 99.9) | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) | 99.7 (99.7 / 99.8) | 99.7 (99.6 / 99.8) | 99.6 (99.5 / 99.8) | 99.8 (99.7 / 99.8) | 100.0 (100.0 / 100.0) |
| extras / 100 req | 9.3 (9.4 / 9.2) | 20.9 (22.6 / 19.2) | 12.3 (11.8 / 12.7) | 7.8 (7.7 / 7.9) | 6.0 (6.4 / 5.6) | 0.0 (0.0 / 0.0) | 8.7 (9.4 / 8.0) | 18.9 (18.2 / 19.5) |
| acc. reqs with unseen name % | 99.8 (99.7 / 99.9) | 100.0 (100.0 / 100.0) | 100.0 (100.0 / 100.0) | 99.8 (99.6 / 100.0) | 99.6 (99.6 / 99.7) | 99.5 (99.4 / 99.7) | 99.9 (99.7 / 100.0) | 100.0 (100.0 / 100.0) |
| zone span F1 (z) x100 | 21.1 (18.4 / 23.9) | 35.7 (32.7 / 38.8) | 23.1 (20.9 / 25.4) | 17.5 (15.5 / 19.4) | 16.0 (13.1 / 19.0) | 0.0 (0.0 / 0.0) | 22.9 (18.7 / 27.1) | 29.0 (26.3 / 31.8) |
| chatter token F1 (z) x100 | 67.1 (63.9 / 70.3) | 82.3 (81.0 / 83.5) | 71.8 (69.0 / 74.7) | 63.2 (60.8 / 65.6) | 56.2 (51.9 / 60.4) | 0.0 (0.0 / 0.0) | 66.2 (62.6 / 69.9) | 79.3 (77.0 / 81.6) |
| zone span F1 (z2) x100 | 59.5 (59.1 / 59.9) | 67.2 (67.0 / 67.4) | 59.9 (62.3 / 57.5) | 56.7 (56.3 / 57.1) | 55.1 (52.1 / 58.1) | 0.0 (0.0 / 0.0) | 63.0 (60.5 / 65.4) | 60.7 (61.9 / 59.5) |
| chatter token F1 (z2) x100 | 80.1 (80.1 / 80.1) | 86.7 (87.9 / 85.6) | 81.8 (82.0 / 81.5) | 77.1 (77.6 / 76.6) | 74.3 (72.5 / 76.1) | 0.0 (0.0 / 0.0) | 82.0 (81.5 / 82.5) | 80.3 (80.7 / 79.9) |

Result: accuracy 99.8% (dev 99.9 / 99.6%): the accuracy condition PASSES, at every number of requests including 4 (never seen in
training) and for requests with unseen names. Extras 9.3 per 100: the extras condition FAILS, as announced: E2 reads every centre,
and every false centre (action word in chatter) becomes an extra request; the count is exactly E0c's (both read all false centres;
E3's job). Overall: E2 FAILS its pre-registered criterion, on the extras only.

What the attention learned (seed 0 / seed 1, softplus of the barrier per kind; high = stops attachment): "." 3.06 / 3.17,
"then" 3.07 / 3.12, "them" 2.17 / 2.56, CHAT 1.66 / 1.53, "it" 1.66 / 1.45, "in" 1.60 / 1.08; but "," 0.03 / 0.03 and "and" 0.35 / 0.40
(both also occur INSIDE requests: "Kasu , delete it", "link A and B"). So the separators were found from the targets alone, without a
hand list, and the ambiguous ones were (rightly) not made barriers.

Zones: E2's weights are not a membership signal: the rule "weight > 0.5" gives span F1 0.21 (worse than E0c), because nothing in the
objective pushes the weight of a gated-out word (chatter, function words) to 0: its term is already silenced by its kind's gate,
so its weight only gets a weak gradient (through the path counts of the words after it). The "placed span" rule gives span F1 0.60 and token F1 0.80, better than E0c's 0.49 on
spans. Zones are still lost to false centres, as in E0c.

### Pre-registered before running: E2u (control) and E4 (generalization, for E2)

- E2u: E2 with every attached token at weight 1 (no attention; same relative addresses, same R = 2 window, same readout). Question:
  is the learned weight what makes E2 work here? Diagnostic, no pass/fail: if E2u is within 2 points of E2, the bounded window and the
  relative addresses do the work on this world and the learned weights are not needed for accuracy.
- E4 (plan): E2 trained on messages with 1-2 requests, tested on 3-4 requests (unseen names included). The plan gives no threshold;
  I fix one: PASS if accuracy on 3-4 requests drops by <= 5 points vs E2 trained on 1-3 requests (same counts in E2's table).

### E2u: control, every attached word at weight 1 (`--exp e2u`)


| measure | all | req1 | req2 | req3 | req4 | chat0 | chat1 | chat2 |
|---|---|---|---|---|---|---|---|---|
| accuracy % | 97.9 (97.6 / 98.2) | 100.0 (100.0 / 100.0) | 98.3 (97.7 / 98.9) | 97.7 (98.2 / 97.3) | 97.3 (96.5 / 98.0) | 97.3 (96.9 / 97.7) | 98.1 (97.8 / 98.4) | 98.3 (98.0 / 98.5) |

E2u reads 97.9% (97.6 / 98.2) against E2's 99.8%: a 1.9-point difference, just inside the 2-point line fixed above. So on this world
most of the work is done by the bounded window (R = 2 nearest centres per side) and the centre-relative addresses; the learned
weights add about 2 points (they mostly remove other requests' words that sit at addresses that collide). The world does not
separate the mechanisms well on accuracy: it is too clean (see E0a).

### E4: generalization of E2, trained on 1-2 requests, tested on 3-4 (`--exp e4`)


| measure | all | req3 | req4 | chat0 | chat1 | chat2 |
|---|---|---|---|---|---|---|
| accuracy % | 99.7 (99.5 / 100.0) | 99.7 (99.4 / 99.9) | 99.7 (99.5 / 100.0) | 99.6 (99.4 / 99.9) | 99.7 (99.4 / 100.0) | 99.8 (99.6 / 100.0) |

(columns: all = the 3-4-request test messages.) Accuracy 99.7% (99.5 / 99.95) vs 99.7% for E2 trained on 1-3 requests at 3 and 4
requests: drop 0 points. PASS. Expected from the design: a centre only ever sees its R nearest centres per side, so a long message
looks locally like a short one.

### Linear cost (`python bench.py`; E2 reader, seed 0 model, one message, 1 CPU thread)

One synthetic message of n tokens (requests of 4 + chatter, repeated). states = computing every centre's state; end to end =
preprocessing + states + attachment windows + readout of every centre. Peak memory = VmHWM above the process baseline (fresh process
per size). Times: best of 3 for states, single run for end to end; another implementer's job was running on the second core.

| tokens | centres | states (s) | end to end (s) | peak extra memory (MB) |
|---|---|---|---|---|
| 10 | 2 | 0.0014 | 0.003 | 7 |
| 100 | 17 | 0.0028 | 0.006 | 8 |
| 1000 | 168 | 0.0280 | 0.084 | 26 |
| 10000 | 1647 | 0.2797 | 0.581 | 153 |
| 100000 | 16351 | 2.9163 | 5.848 | 855 |

From 1 000 to 100 000 tokens: states x104, end to end x70, memory x33 (from 10 000 to 100 000: states x10.4, end to end x10.1,
memory x5.6). Time: PASS (linear, inside 50-200). Memory: outside the pre-registered band, on the LOW side (a fixed part dominates
at 1 000 tokens; growth is at most linear), so it is not super-linear; by the letter of my threshold it is a FAIL of a badly set lower
bound, not of linearity. Nothing is n^2: per token the work is R = 2 slots per side, prefix sums of weighted kind counts (T x R x K
numbers) and one D-vector per centre (2 KB at D = 256). At 100 000 tokens the peak is ~8.5 KB per token, dominated by holding every
token's star (and two re-ordered copies) at once; 1 million tokens would need ~8.5 GB in this implementation, more than this machine.
A streaming version (process the text in chunks, carry the prefix sums and the open centres across chunk borders, which is possible
because a token only reaches R centres per side) would keep memory at O(chunk + number of centres); not built tonight.

### Zones on messages without false centres (diagnostic breakdown of the E2 test run, same models, no retraining)

Test messages with chatter but no action word inside the chatter (565 / 537 messages): E2 zone span F1 0.81 / 0.81, chatter token
F1 0.92 / 0.93 with the placed-span rule (0.32 / 0.41 with the weight rule). So when no false centre claims the chatter, the placed
words of the centres delimit the chatter zones well. Checked on seed 0 (146 false zones, 134 missed): 83 of the false zones are one
function word at the edge of a fronted request that no role places ("the Kasu , delete it": "the" and "it" left out as zones), others
are a real chatter zone glued to such a word ("them cool really cool"), and a few come from a name inside chatter claimed by a
neighbouring request ("this is for Dogote" -> only "this is for" handed back). The false centres are the main zone problem, as for
accuracy; the edge words would need a rule "a run of words that no role explains but that sits between a centre and its placed words
belongs to the centre" or a learned membership (see recommendation).

## Summary of pass / fail

| experiment | threshold (fixed before) | result (mean of seeds 0, 1) | verdict |
|---|---|---|---|
| E0a gold cut | sanity >= 90% | 99.4%, 0 extras | met |
| E0b one state per message | baseline | 32.9% (97 / 43 / 26 / 17% at 1 / 2 / 3 / 4 requests) | - |
| E0c hard centres (today) | baseline | 89.3%, 9.3 extras / 100, zone span F1 0.44-0.49 | - |
| E1 relative addresses, gold assignment | >= E0a - 2 | 100.0% | PASS |
| E2 learned soft attention (linear) | acc >= E0a - 5 AND extras <= 2 x E0a (= 0) | 99.8%, 9.3 extras / 100 | FAIL (extras only; accuracy passes) |
| E2u control, weights all 1 | diagnostic: within 2 points of E2? | 97.9% (-1.9) | window + relative addresses do most of the work |
| E4 E2 trained on 1-2 requests, tested on 3-4 | drop <= 5 points | 99.7%, drop 0 | PASS |
| cost, 1k -> 100k tokens | time and memory x50-x200 | time x104 (states), x70 (end to end); memory x33 | time PASS; memory below the band (sub-linear), not super-linear |
| zones (E2, placed-span rule) | descriptive | span F1 0.60, token F1 0.80; 0.81 / 0.92 without false centres | - |

Big caveat: the synthetic world is much cleaner than real messages (gold-cut reading 99% here vs 52% on the real dev split; hard
centres 89% here vs 42%). Accuracy differences between the methods are therefore small here; what the world does show clearly is
where the errors come from: false centres (extra requests, lost zones), and the cut (E0c loses 4 points even without chatter).

## Recommendation (plain words)

1. One VSS state per centre, the centre being each action word; words addressed RELATIVE to their centre (the path restarts at the
   action word and runs outwards on both sides). It reads as well as a perfect cut (E1 100%, E2 99.8% vs 99.4% for the gold cut) and
   does not need the request to start at the verb (fronted requests "Kasu , delete it" read fine).
2. Keep it linear by construction: each word reaches only its 2 nearest centres on each side; the relative path is a prefix sum of
   weighted kind counts; one D-vector per centre. Measured: time grows linearly up to 100 000 tokens (3 s for the states). For
   1 million tokens, stream the text in chunks (memory today ~8.5 KB per token because all word stars are held at once).
3. Learn the word-to-centre weights from the per-request targets only (no separate cutter): the learned "barrier" per kind found by
   itself that "." and "then" end a request while "," and "and" do not (they also occur inside requests). On this world the weights
   add ~2 points over "attach everything within 2 centres"; on real text, where requests are longer and messier, they should matter
   more, which needs to be measured there.
4. The open problem is not attaching words but deciding WHICH centres are requests. Every action word inside chatter became an extra
   request (9 per 100) in both today's method and E2, and it swallows its chatter zone. This is E3: accept a centre only when its
   state reads with enough confidence (threshold on dev), or add a learned null centre. I would do E3 next, before anything else.
5. Zones for the other worlds: take a request's extent as the span from its first to its last placed word (not the attention
   weights, which are not trained to be a membership); everything outside every accepted request is handed back as zones. This gives
   zone span F1 0.81 when there are no false centres; the remaining errors are function words at request edges ("the", "it") and
   names inside chatter. If the owner wants better zones, the annotation already has the gold word-to-request assignment and the
   weights could be trained on it directly (an extra loss on the existing reader, to be approved before it is built).
6. Validate on the real messages before deciding: this world is too clean to rank the variants finely.
