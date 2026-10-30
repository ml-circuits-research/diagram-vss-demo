# Attention for VSS constellations: implementer B (independent replication)

Code: `world.py` (synthetic worlds), `vss.py` (mini-VSS readers), `exp.py` (E0-E4; `--tag e4 --train_n 1,2` for E4), `e5.py`
(two worlds), `scale.py` (cost vs length), `aggregate.py` (tables).
Logs and per-message records: `logs/`.

## Setup (fixed before any run)

World A (diagram): create(shape, color?, name), connect(source, target), move(object, relation, landmark), set(object, color),
delete(object); two action words per event; 2-5 surface orders per event, 20% of requests with the argument fronted
("Wing , move it above Tail"), optional "the" before names. 60 synthetic capitalised names: 45 for train/dev/test_seen, 15 only in
test_unseen. Message: 1-4 requests (uniform), separators "," / "and" / "then" / ", then" / "." / "and then" / nothing; 0-2 chatter
phrases (uniform) of 2-5 chatter words; a chatter phrase contains an action word used non-actively ("this is a draw") with p = 0.3
(false centre). Gold: requests + one label per token (request, chatter, separator).

Kinds: action word -> ACT_<event>; value word -> its value class (SHAPE, COLOR, REL); capitalised -> NAME; closed-class function
words (the, a, to, from, with, and, then, ",", ".", called, as, in, it, them, of, on, for, about, some, is) -> their own kind; all
other words (chatter, unseen, other world) -> OTHER. Assumption: function words get their own kinds (in the real tool they are "other";
here the readers need "to" vs "from" to tell source from target).

Mini-VSS: D = 256, fixed random phase stars; target = P x F[action word] + sum_r R_r x F[filler]; objective max cos; Adam lr 0.02,
batch 16, 3 epochs over 8000 training messages (or 7 minutes, whichever first). Reading: unbind P, then each role key of the read event;
candidates = words of the input of the role's kinds; optional role (create.color) by a presence ratio chosen on dev; one-to-one.
Request correct = event + every role right. Sets: dev 800 messages (every choice), test_seen 1000, test_unseen 1000 (unseen names).
Extra = a reading returned by a centre that is not a gold request's action word (false centre). Zone F1 = exact-span F1 of the
unexplained zones (maximal runs of tokens attached to no accepted centre with weight >= 0.5, trimmed of , . and then at both ends)
against the gold non-request zones (same trimming).

Standard reader (E0): address = path code from the start of the input (prefix sum of per-kind phases) + left bigram + right bigram
code; gate per kind.
Centre reader (E1-E3): every action-kind word is a centre; every other word is attached to at most 2 centres, the nearest on each side
(bounded, linear); centre-relative address = difference of prefix sums of per-kind phases between the centre and the word (separate
phases for the left and right side) + the same bigram codes; one D-vector per centre. This is the beacon-relative emitter of
v8_gates.set_rel_emitters generalised: there a trigger draws the next word a second time relative to its own address; here the centre
is the beacon and every attached word is drawn relative to it, at any distance.

Smoke test (before any registered run, seed 9, 300 training messages, 1 epoch, tag `smoke`): the code runs end to end; numbers not
reported, nothing chosen from them.

## Pre-registered hypotheses and thresholds (written before the registered runs)

All numbers: mean over seeds 0 and 1 (per-seed values in the tables), test sets reported once; every threshold/choice on dev.

- **E0a** (gold cut, standard reader). Sanity: dev accuracy >= 0.95, else the mini-VSS is fixed first.
- **E0b** (no cut, one state per message, target = sum of the message's requests, ONE reading per message). Hypothesis: near E0a
  for 1 request, at most ~1/n of the requests for n >= 2. Descriptive, no threshold.
- **E0c** (today's hard centres: cut at every action word, words before the first centre go to the first; each piece read by the
  E0a model). Descriptive baseline: expected losses on fronted arguments and extras from false centres. Returns no zones.
- **E1** (centre-relative addresses, GOLD attachment). Threshold: test accuracy within 2 points of E0a (both test sets).
- **E2** (learned soft attachment, bounded to the nearest centre on each side, no null). Threshold: accuracy >= E0a - 5 points and
  extra requests <= 2x E0a. E0a has 0 extras by construction (one reading per gold span), so the extras threshold is stated as
  <= 0.05 extra readings per gold request. Zone F1 descriptive.
- **E3a** (E2 model + accept a centre only if its reading's confidence = min(predicate score, required-role scores) >= a threshold
  chosen on dev by max(correct - extra)). **E3b** (learned null centre: per-token null probability from the kinds in a +-2 window,
  multiplies every attachment; trained end to end with the cos loss plus a binary loss on the centres only (gold: is this action word a
  request); a centre is rejected when its null probability >= 0.5). Threshold for each: extra requests halved vs E2 with accuracy
  loss <= 2 points. Added (owner requirement on zones): zone F1 >= 0.80 for the zones to be useful to another world.
- **E4**: same architectures trained on 1-2 requests per message, tested on 3-4 (seen and unseen names). Report the drop vs the
  models trained on 1-4 (same test messages). Hypothesis: centre readers drop <= 3 points (attachment is local, bounded to neighbouring
  centres); no pass/fail threshold in the plan, so I state one: drop <= 3 points = generalises.
- **Linear cost** (owner requirement): one message of 10, 100, 1 000, 10 000, 100 000 tokens; wall time and peak memory of the
  centre reader (states + reading). Threshold: time per token and memory per token at 100 000 within 2x of those at 1 000.

### World change after the first E0 run (stated plainly)

E0 was first run on world v1 (seed 0, `logs/v1/main_s0.json`): E0a 1.000 on dev and both tests; E0c 0.858 / 0.862 (test seen /
unseen) with only 0.2-0.3% extra readings; E0b 0.278 / 0.282. In v1 chatter never mentions a name, colour or shape, so a false centre
almost always abstains (no filler candidate near it) and E3 cannot be tested; real chatter does mention objects ("the Wing looks
nice"). World v2 (all runs below): a chatter phrase mentions one value word (a name, colour or shape) with p = 0.4. Nothing else
changed; no model setting was changed. All E0 numbers below are re-run on v2.

### Zone rule: the pre-registered rule failed for a measurement reason; second rule registered before re-running

First E1-E3 run (seeds 0, 1; `logs/main_s*.json` keys E1..E3b, numbers in the tables below as "zone rule 1"): zone F1 0.13-0.17 for
E2/E3a/E3b, far below 0.80. Diagnosis on 300 dev messages of seed 0 (E3b model): chatter tokens are attached with mean weight 0.005
(0.2% >= 0.5), separators 0.002; but request tokens too are attached with small ABSOLUTE weights (mean 0.22; only 17% >= 0.5). The
cos objective does not see the scale of a state, so the weights are only meaningful relative to each other; the absolute 0.5 cut
declares most request words unexplained. Zone rule 1 is kept as reported (fail). **Zone rule 2** (registered now, before re-running):
a token is explained iff an accepted centre attaches it with weight >= rho x that centre's own self-weight; rho chosen on dev from
{0.05, 0.10, ..., 0.95} by zone F1. Same threshold (zone F1 >= 0.80). Models are re-trained with the same seeds (deterministic
data and init; the reading numbers must reproduce).

Zone rule 2 result (same models, reproduced reading numbers exactly): rho chosen on dev = 0.05 (the bottom of the grid) and zone F1
0.36-0.48: still a fail. Diagnosis (seed 0 dev, E3b): inside requests the content words are attached at 1.3-2.2x the centre's
self-weight, but the function words (a, the, to, from, it, as, called, ",") at 0.005-0.06x. The cos objective only rewards words whose
stars are in the target (action word + fillers), so it learns to IGNORE the request's function words: they come out "unexplained" and
split every request into small zones. This is the "word explained signal is weak" finding of EXPERIMENT_BOUNDARIES.md reproduced on
the synthetic world.

**E3c** (registered before running): E3b + the attachment weights trained also against the GOLD attachment (binary loss, every
(word, centre) pair in the bounded window: 1 if the word belongs to that centre's request, 0 otherwise; chatter and separators 0 for
every centre; a false centre's self-weight 0). The annotation already has this (one request label per token). Zone rule 1 (absolute
0.5: the weights are now calibrated probabilities) is the registered rule; rule 2 reported alongside. Thresholds as E3: extras halved
vs E2, accuracy loss <= 2 points, zone F1 >= 0.80.

### E5 registration (written before the E5 run)

World B (errands): buy(item, qty?), schedule(meeting, day), cancel(meeting), remind(person, meeting). Shared with A: the action words
add (A create / B buy), move (A move / B schedule), remove (A delete / B cancel), the names (A objects / B persons), all function and
chatter words. Each world's reader is the E3c centre reader trained ONLY on its own world's messages (requests + chatter; A = the
seed's main E3c model). Mixed test messages: 1-4 requests, each from A or B with p = 0.5, 0-2 chatter phrases (false centres from
both worlds' action words), 1000 messages per seed with seen names and 1000 with unseen names.
Pipeline: A reads the message (accepted centres -> A requests); A's zones (zone rule 1) are handed to B; B reads every zone as an
input of its own. Nothing is chosen on the mixed set (presence thresholds from each world's own dev, zone rule fixed).
Measures: A requests right; B requests recovered from A's zones; B gold-cut accuracy (B standard reader on B's gold spans of the same
messages); cross-world mistakes (an A reading accepted at a B request's action word and vice versa); extras on chatter; leftover:
B's zones inside A's zones against the gold pure-chatter zones (exact-span F1). Reference: B reading the whole message directly.
**Threshold (PLAN.md)**: B recovered from A's zones >= 0.80 x B's gold-cut accuracy.
Prior mechanisms in training/vss/tool/sop: the dispatcher by fit (every world reads, smallest residual wins, refusal above
no_fit_residual) and R81 negative examples (a sentence of another world trained towards MINUS the anchor state). The pipeline above
uses neither (A never sees B); R81-style negatives are the registered fallback variant if the threshold is missed.

E5 main run passed (numbers below). Added after it, labelled EXPLORATORY (not part of pass/fail): the R81-style variant (A trained
with world-B requests inside its messages labelled "not this world"), to see whether the 7% of B requests that A steals through the
shared action words can be removed when A has seen the other world.

### E3d registration (after E3c, written before running E3d)

Error analysis (seed 0, test_seen, E3c): of 41 wrong requests, 36 are FRONTED create requests ("Nene , draw it as a black oval":
36 of 106 wrong for E3c, 47 of 106 for E2; every other event x form <= 2 errors). The reader
takes a name from the previous request. Cause: the centre-relative address of a fronted argument ("NAME , ACT it") is the same for
every event, and the bigram code is centre-independent, but the role differs (create -> name, move/set/delete -> object): the
address has to serve two roles at once and loses against neighbouring names. **E3d**: E3c with the relative phases keyed also by the
centre's kind (thR[k_centre, k_word], thL[k_centre, k_word]; one prefix scan per centre kind, still linear), as the verb-order route
of v8 is keyed by the category of the nearest verb. Also **E1d** (same addresses, gold attachment). Hypothesis: the fronted-create
errors disappear; threshold: E3d accuracy >= E0a - 1 point on both test sets, extras and zone F1 within the E3c thresholds.

---------------------------------------------------------------------------------------------------------------------------------

# Results (world v2, D = 256, seeds 0 and 1; mean, per seed in brackets; produced by `aggregate.py` from `logs/`, full in `logs/tables.md`)

Columns: request-level exact accuracy overall, by number of requests per message (n) and by number of chatter phrases; extra readings
per gold request; zone F1. Each training run took 25-30 s (8000 messages x 3 epochs); every run well under 10 minutes.

## E0 baselines

| exp | test | all (s0 / s1) | n=1 | n=2 | n=3 | n=4 | chatter 0 | chatter 1 | chatter 2 | extra / gold req | zone F1 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E0a gold cut | test_seen | 1.000 (1.000 / 1.000) | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.000 | - |
| E0a gold cut | test_unseen | 1.000 (1.000 / 1.000) | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.000 | - |
| E0b no cut | test_seen | 0.275 (0.268 / 0.281) | 0.973 | 0.384 | 0.196 | 0.113 | 0.276 | 0.267 | 0.282 | 0.000 | - |
| E0b no cut | test_unseen | 0.279 (0.280 / 0.279) | 0.987 | 0.357 | 0.187 | 0.116 | 0.285 | 0.278 | 0.276 | 0.000 | - |
| E0c hard centres | test_seen | 0.849 (0.852 / 0.847) | 0.947 | 0.841 | 0.852 | 0.827 | 0.869 | 0.832 | 0.844 | 0.009 | 0 (no zones) |
| E0c hard centres | test_unseen | 0.856 (0.862 / 0.851) | 0.950 | 0.866 | 0.831 | 0.845 | 0.872 | 0.864 | 0.833 | 0.007 | 0 (no zones) |

- E0a sanity (dev >= 0.95): **pass** (1.000 on dev and both tests, both seeds). The synthetic world is easy once it is cut right; the
  mini-VSS (path + left/right bigram + gate per kind) reads every surface order, fronted arguments included.
- E0b: as expected, about one request per message (n=1: 0.97-0.99; n=4: 0.11). Chatter alone hardly hurts a single request.
- E0c: 0.85. Loses on fronted arguments ("Nene , draw it ..." : the name lands in the previous piece) and on n >= 2; few extras
  (0.7-0.9%) because in this world a chatter piece rarely has the fillers its action word needs, so the reading abstains.

## E1 / E1d: centre-relative addresses with the GOLD attachment

| exp | test | all (s0 / s1) | n=1 | n=2 | n=3 | n=4 | chatter 0 | chatter 1 | chatter 2 |
|---|---|---|---|---|---|---|---|---|---|
| E1 (phases by word kind) | test_seen | 0.993 (0.992 / 0.994) | 0.998 | 0.997 | 0.989 | 0.992 | 0.996 | 0.991 | 0.992 |
| E1 | test_unseen | 0.994 (0.994 / 0.993) | 0.998 | 0.994 | 0.993 | 0.992 | 0.994 | 0.993 | 0.994 |
| E1d (phases by centre kind x word kind) | test_seen | 1.000 (1.000 / 1.000) | 1.000 | 1.000 | 1.000 | 0.999 | 1.000 | 1.000 | 0.999 |
| E1d | test_unseen | 1.000 (1.000 / 1.000) | 0.998 | 1.000 | 1.000 | 0.999 | 0.999 | 1.000 | 0.999 |

Threshold (within 2 points of E0a): **E1 pass** (-0.7 / -0.6 points), **E1d pass** (0.0). Addressing words relative to their centre,
outwards in both directions, reads as well as the gold cut; keyed by the centre's kind it is exact.

## E2: learned soft attachment (bounded: nearest centre on each side), no rejection

| exp | test | all (s0 / s1) | n=1 | n=2 | n=3 | n=4 | chatter 0 | chatter 1 | chatter 2 | extra / gold req | zone F1 (rule 1 / rule 2) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E2 | test_seen | 0.982 (0.981 / 0.984) | 0.998 | 0.980 | 0.981 | 0.980 | 0.985 | 0.980 | 0.982 | 0.037 | 0.143 / 0.373 |
| E2 | test_unseen | 0.984 (0.981 / 0.987) | 0.996 | 0.982 | 0.983 | 0.981 | 0.983 | 0.982 | 0.986 | 0.040 | 0.153 / 0.389 |

Threshold (accuracy >= E0a - 5 = 0.95; extras <= 0.05 per gold request): **pass** (0.98; 0.037-0.040). Honest caveat: E2 has 4-5x the
extras of the hard-centres baseline E0c (0.8%), because a false centre now reaches the fillers of its neighbours; and its zones are
useless (see the zone rule notes above: the cos objective does not attach the requests' function words).
What it learned: the attachment depends on kinds and distance, with a learned cost per kind for every word in between; chatter and
separators get weight ~0 without being told which words they are (measured on the E3b model, whose only extra signal is
whether each action word is a request: mean weight 0.005 for chatter, 0.002 for separators).

## E3: false centres

| exp | test | all (s0 / s1) | n=1 | n=2 | n=3 | n=4 | chatter 0 | chatter 1 | chatter 2 | extra / gold req | zone F1 (rule 1 / rule 2) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E3a confidence threshold | test_seen | 0.963 (0.962 / 0.965) | 0.967 | 0.960 | 0.966 | 0.962 | 0.963 | 0.959 | 0.969 | 0.008 | 0.158 / 0.421 |
| E3a | test_unseen | 0.960 (0.956 / 0.964) | 0.971 | 0.955 | 0.960 | 0.959 | 0.957 | 0.963 | 0.959 | 0.005 | 0.167 / 0.443 |
| E3b learned null centre | test_seen | 0.981 (0.979 / 0.982) | 0.998 | 0.978 | 0.979 | 0.979 | 0.984 | 0.978 | 0.980 | 0.001 | 0.138 / 0.417 |
| E3b | test_unseen | 0.984 (0.981 / 0.987) | 0.994 | 0.984 | 0.983 | 0.982 | 0.984 | 0.982 | 0.986 | 0.002 | 0.144 / 0.443 |
| E3c null + gold attachment loss | test_seen | 0.985 (0.983 / 0.986) | 0.998 | 0.987 | 0.981 | 0.983 | 0.987 | 0.983 | 0.984 | 0.002 | **0.907** / 0.939 |
| E3c | test_unseen | 0.987 (0.986 / 0.988) | 0.996 | 0.982 | 0.986 | 0.987 | 0.989 | 0.986 | 0.986 | 0.002 | **0.914** / 0.957 |
| E3d = E3c + phases by centre kind | test_seen | 0.996 (0.996 / 0.996) | 1.000 | 0.997 | 0.995 | 0.996 | 0.998 | 0.996 | 0.994 | 0.002 | **0.906** / 0.941 |
| E3d | test_unseen | 0.997 (0.998 / 0.996) | 0.994 | 0.998 | 0.997 | 0.997 | 0.997 | 0.997 | 0.996 | 0.002 | **0.915** / 0.958 |

Dev choices: E3a confidence threshold 0.06 / 0.04 (seed 0 / 1); zone rule 2 rho 0.05 (E2, E3a, E3b), 0.15 (E3c, E3d).

| exp | extras halved vs E2? | accuracy loss vs E2 <= 2 points? | zone F1 >= 0.80? | verdict |
|---|---|---|---|---|
| E3a | yes (0.037 -> 0.008, 0.040 -> 0.005) | no on test_unseen (-1.9 seen, **-2.4** unseen) | no (0.16) | **fail** |
| E3b | yes (-> 0.001 / 0.002) | yes (-0.1 / 0.0) | no (0.14; rule 2: 0.42-0.44) | **pass on extras, fail on zones** |
| E3c | yes (-> 0.002 / 0.002) | yes (+0.3 / +0.3) | yes (0.91) | **pass** |
| E3d | yes (-> 0.002) | yes (+1.4 / +1.3) | yes (0.91) | **pass**; also >= E0a - 1 (0.996 / 0.997): pass |

What I learned:
- A confidence threshold on the reading (E3a) is a poor filter: the confidence of a true request and of a false centre overlap,
  so removing false centres also removes ~2 points of real requests.
- A learned null centre (E3b: a per-token "belongs to nobody" probability from the kinds in a +-2 window, trained on whether each
  action word is a request) removes 95-97% of the extras at no accuracy cost.
- Zones need the attachment to be trained on the annotation (E3c). With the cos objective alone, the weights only say what is useful
  to rebuild the target, so the requests' function words come out "unexplained" (zone F1 0.14). Trained against the gold attachment,
  the same bounded attention gives zone F1 0.91 (0.94-0.96 with the relative rule) and accuracy is unchanged or better.
- The remaining errors of E2/E3c were almost all fronted create requests: an address that ignores the centre's kind must serve two
  roles; keying the relative phases by the centre's kind (E3d, the analogue of the v8 verb-order route) removes them (0.996-0.997).

## E4: train on 1-2 requests per message, test on 3-4 (seen and unseen names)

| exp | test | trained 1-4, on n=3-4 | trained 1-2, on n=3-4 | drop (points) |
|---|---|---|---|---|
| E0a | test_seen | 1.000 | 1.000 | +0.0 |
| E0a | test_unseen | 1.000 | 1.000 | +0.0 |
| E0c | test_seen | 0.838 | 0.839 | -0.1 |
| E0c | test_unseen | 0.839 | 0.842 | -0.3 |
| E1 | test_seen | 0.991 | 0.992 | -0.1 |
| E1 | test_unseen | 0.993 | 0.992 | +0.0 |
| E2 | test_seen | 0.981 | 0.977 | +0.4 |
| E2 | test_unseen | 0.982 | 0.981 | +0.1 |
| E3a | test_seen | 0.964 | 0.959 | +0.5 |
| E3a | test_unseen | 0.959 | 0.957 | +0.2 |
| E3b | test_seen | 0.979 | 0.976 | +0.3 |
| E3b | test_unseen | 0.983 | 0.980 | +0.2 |
| E3c | test_seen | 0.982 | 0.984 | -0.1 |
| E3c | test_unseen | 0.987 | 0.987 | -0.0 |
| E1d | test_seen | 1.000 | 1.000 | -0.0 |
| E1d | test_unseen | 1.000 | 0.999 | +0.0 |
| E3d | test_seen | 0.995 | 0.993 | +0.3 |
| E3d | test_unseen | 0.997 | 0.994 | +0.4 |

(positive drop = worse when trained on 1-2.) E3d trained on 1-2: 0.994 / 0.994 overall, extras 0.001-0.002, zone F1 0.937 / 0.933.
Threshold (drop <= 3 points): **pass for every reader** (largest drop 0.5 points). Unseen names cost nothing either (names enter
only through their kind and their own star; every address is per kind). Expected: with attachment bounded to the neighbouring
centres, a state never "sees" how many requests the message has.

## Linear cost (owner requirement)

One message of N tokens (test-style messages joined by "."), seed-0 model, CPU 1 thread, D = 256; states computed with streamed
prefix scans (`vss.states_stream`, 4096-token chunks; checked equal to the full computation within 2e-7 at N <= 10 000, chunk 64).
Time = encode + states (best of 3) + reading of every centre. Memory = peak RSS above the process baseline. (`logs/scale_e3c.json`,
`logs/scale_e3d.json`; the cost does not depend on the seed, so one model per variant.)

| tokens | centres | E3c total s | E3c us/token | E3c MB | E3c KB/token | E3d total s | E3d us/token | E3d MB | E3d KB/token |
|---|---|---|---|---|---|---|---|---|---|
| 10 | 2 | 0.002 | 210 | 2.4 | 240 | 0.002 | 230 | 2.3 | 230 |
| 100 | 13 | 0.005 | 51 | 3.2 | 32 | 0.008 | 76 | 5.8 | 58 |
| 1 000 | 142 | 0.033 | 33 | 19.5 | 19.5 | 0.086 | 86 | 68.7 | 68.7 |
| 10 000 | 1 445 | 0.445 | 45 | 102 | 10.2 | 1.25 | 125 | 293 | 29.3 |
| 100 000 | 14 711 | 3.99 | 40 | 234 | 2.3 | 11.8 | 118 | 474 | 4.7 |
| 1 000 000 | 147 593 | 46.6 | 47 | 1 849 | 1.8 | 111 | 111 | 1 920 | 1.9 |

Threshold (time and memory per token at 100 000 within 2x of 1 000): **pass** (time 1.2x for E3c, 1.4x for E3d; memory per token
falls). Cost grows linearly up to 1 million tokens. Memory at 1M is mostly the output (one D-vector per centre) and the reading's
score tables (centres x vocabulary per role); the states themselves need O(chunk x D) working memory. E3d costs ~2.5-3x E3c (one
prefix scan per centre kind present: 5 here). Accuracy on the long message is the same at every length (0.972 E3c, 0.985 E3d; lower
than the test tables because this script reads optional roles with a fixed presence ratio 0 instead of the dev-chosen one).

## E5: two worlds, A reads its requests and hands its zones to B

| measure | test_seen (s0 / s1) | test_unseen (s0 / s1) |
|---|---|---|
| A requests right (of A's requests) | 0.988 (0.991 / 0.985) | 0.988 (0.990 / 0.986) |
| B gold-cut accuracy (standard reader on B spans) | 0.949 (0.944 / 0.954) | 0.953 (0.957 / 0.949) |
| B requests recovered from A's zones | 0.878 (0.872 / 0.884) | 0.875 (0.880 / 0.870) |
| **recovery ratio (recovered / gold cut)** | **0.925** (0.923 / 0.927) | **0.919** (0.920 / 0.917) |
| reference: B reading the whole message directly | 0.947 (0.943 / 0.952) | 0.952 (0.957 / 0.948) |
| A readings accepted on a B request (per B request) | 0.070 (0.072 / 0.069) | 0.078 (0.077 / 0.078) |
| B readings (from zones) on an A request (per A request) | 0.000 | 0.000 |
| B direct readings on an A request (per A request) | 0.036 (0.042 / 0.030) | 0.031 (0.035 / 0.027) |
| A extras on chatter / B extras on chatter | 0.002 / 0.002 | 0.004 / 0.000 |
| A's zones vs gold "not an A request" zones, F1 | 0.888 (0.887 / 0.890) | 0.876 (0.882 / 0.869) |
| leftover (B's zones inside A's zones) vs gold pure chatter, F1 | 0.894 (0.890 / 0.897) | 0.881 (0.886 / 0.877) |

Threshold (recovered >= 0.80 x B gold cut): **pass** (0.92). Where B's requests are lost: 7-8% of them are taken by A through the
shared action words (add / move / remove): A accepts the centre and reads it with names from neighbouring requests, so the words never
reach B. The reverse never happens (A's requests are not in A's zones).

Exploratory (not part of pass/fail), R81-style negatives: A trained with B requests inside its messages labelled "not this world":

| measure | test_seen | test_unseen |
|---|---|---|
| A requests right | 0.983 | 0.986 |
| B recovered from A's zones / ratio to gold cut | 0.947 / 0.998 | 0.952 / 0.999 |
| A on B requests | 0.000 | 0.000 |
| A's zone F1 / leftover chatter F1 | 0.962 / 0.944 | 0.959 / 0.940 |

When A has seen examples of the other world as "not mine", A stops stealing (0.000) and B recovers everything the gold cut gives,
at -0.5 points for A.

## Architecture recommendation (plain words)

1. Keep one VSS state per action word (a "centre"), but do NOT cut the text with hard boundaries. Let every word attach to at most two
   centres, the nearest one on its left and the nearest one on its right, with a learned weight. The weight depends only on kinds:
   the word's kind, the centre's kind, which side, the distance, and a learned cost for each word in between. This is linear in the
   length of the text (measured up to 1 million tokens) and keeps one fixed-size vector per centre.
2. Write each attached word at an address RELATIVE TO ITS CENTRE (the phases of the words between them, summed outwards from the
   centre with running prefix sums), and let these phases depend on the centre's kind (which action it is), like the verb-order
   route. With the gold attachment this reads exactly like the gold cut (E1d 1.000); with learned attachment 0.996-0.997.
3. Give every word a learned "belongs to no centre" (null) probability from the kinds around it, and train it on whether each action
   word is a request. This removes false centres ("this is a nice draw") almost completely (extras 4% -> 0.2%) at no cost. Do not use
   a confidence threshold on the reading instead: it costs ~2 points of real requests.
4. Train the attachment weights also on the annotated spans (which word belongs to which request). Without this the reader ignores
   function words and cannot say which parts of the text it did not understand (zone F1 0.14); with it, it returns those zones
   (F1 0.91), and another world can read them: 92% of the other world's requests recovered vs its gold cut, 100% when each world has
   also seen a few examples of the other world as "not mine" (R81-style negatives). Plan for that: shared action words (add, move,
   remove) are where worlds steal from each other.
5. Caveats: the synthetic world is clean (one action word per request, every request has its action word, chatter is short); the gold
   cut reads it perfectly. The real messages are harder: missed action words, requests without a verb, long chatter, corrections.
   What transfers is the mechanism and the failure modes (function words not attached, false centres, shared verbs), not the numbers.
   The two learned additions (null probability, attachment loss) are new learned components and need the owner's approval before they
   enter the real tool.
