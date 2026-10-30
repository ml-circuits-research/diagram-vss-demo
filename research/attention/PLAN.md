# Overnight plan (2026-10-31): attention for VSS constellations, on synthetic worlds

## Why

On realistic diagram messages (several requests + chatter per message), VSS reads ONE request per state. Today's findings
(training/sketch/EXPERIMENT_BOUNDARIES.md):
- fed the annotated requests one by one, VSS gets 52% of them fully right; with a separate learned cutter, 50%;
- letting VSS cut by itself with hard "centres" (one state per action word, a word belongs to the centre whose reading places it)
  gives 42% and ~200 extra commands: chatter becomes centres, missed action words merge requests, and the "word explained" signal is
  weak;
- in older repos (WikiSQL, SNIPS) every input was ONE request, so several centres were never tested.

The owner's idea: an attention-like mechanism adapted to VSA constellations: several centres of gravity, each word attached to each
centre with a learned weight, chatter attached to none. Goal of the night: a credible, measured architecture proposal.

## The synthetic world (small, controlled, fast on CPU)

- Vocabulary with kinds: action words (one or two per event: e.g. draw/add -> create, link/connect -> connect, move/put -> move,
  paint/make -> set, delete/remove -> delete), names (NAME, ~60, some only in test), colours, shapes, relations (above, below, left_of,
  right_of, next_to), function words (the, a, to, from, with, and, then, ","), chatter words (~40: so, uh, because, nice, this, is,
  looks, good, I, think, ...).
- Events and roles: create(shape, color, name), connect(source, target), move(object, relation, landmark), set(object, color),
  delete(object). Several surface orders per event (e.g. "connect A to B", "link A with B", "A to B connect"?? no: keep plausible
  English orders), optional "the".
- A message: 1 to 4 requests, joined by varied separators (", ", " and ", " then ", ". ", nothing), with 0-2 chatter phrases
  before, between or after; a chatter phrase may contain an action word used non-actively (e.g. "this is a draw of the map") with a
  set probability (false centres).
- Gold per message: the requests (event + roles) and, for every token, which request it belongs to (or chatter).
- Splits: train / dev / test, test with unseen names and with more requests per message than training (generalization).

## The mini-VSS (one shared implementation, PyTorch on CPU, D = 256 or 512)

Mirrors the VSS reader of vss-demo: fixed random phase vectors (stars) for words, role keys and a predicate key; the state is the sum
over words of (learned address, from the word's kind and its context: a path code over the kinds before it and a bigram code with its
neighbour) times (the word's star), with a learned gate per kind; the training target is the request's world state (sum over roles of
role key x filler star, plus predicate key x action star); objective max cos(state, target); reading by unbinding each role key and
taking the best candidate among the words of the role's kinds, presence by a threshold chosen on dev.

## Experiments (each: hypothesis, measure, threshold fixed BEFORE running)

Measures for all: request-level exact accuracy (event + every role right), extra requests (not asked for), by number of requests per
message and by chatter level; dev for every choice, test reported once.

- E0 baselines: (a) gold cut + standard reader; (b) no cut, one state for the whole message; (c) today's hard-centres method.
- E1 centre-relative addresses with the GOLD assignment of words to requests: does addressing words relative to their centre (path
  code restarting at the centre, outwards in both directions) read as well as the gold cut? Threshold: within 2 points of E0a.
- E2 learned soft attention: for every centre c (action-word position) a state S_c = sum_i w_ic * address_ic * star_i, with
  w_ic = sigmoid(learned score of: kind of word i, kind of centre, signed distance bucket, number of other centres between them,
  separators between them); trained end to end with the per-request targets (chatter has no target). Threshold: >= E0a - 5 points
  and extra requests <= 2x E0a.
- E3 false centres: a centre is accepted only if its state reads an event with enough confidence (threshold on dev), or a learned
  "null" centre absorbs chatter. Threshold: extra requests halved vs E2 with accuracy loss <= 2 points.
- E4 generalization: train on 1-2 requests per message, test on 3-4; unseen names. Report the drop.

## Rules for the agents

- Work only in your folder under research/attention/; read docs and code of training/vss (the copied vss-demo tool) and the repos
  under /home/claude/ml-circuits-research and /home/claude/vss-demo for reference only; never modify them.
- Python in /home/claude/venv (torch CPU, numpy). The machine has 2 cores and ~7 GB: keep every run under ~10 minutes; no parallel
  heavy runs.
- No knob turned after seeing a test number. Write the hypothesis, measure and threshold in your RESULTS.md BEFORE each run; report
  negative results as they are. Seeds: at least 2 for every reported number.
- Do not commit; the coordinator commits.

## Added requirement (owner, 01:02): linear in the number of tokens

A context limit is acceptable (BERT has 512 tokens), but the target is texts of up to ~1 million tokens with cost LINEAR in the number
of tokens: no all-pairs (n^2) attention. So every design must keep each word attached to a bounded number of centres (e.g. the
nearest centres on each side, or centres within a window), compute centre-relative addresses with running products / prefix scans,
and keep one fixed-size D-vector per centre. Every implementer measures wall time and memory for one message of 10, 100, 1 000,
10 000 and 100 000 tokens (synthetic: many requests with chatter) and reports whether the cost grows linearly.

## Added requirement (owner, 01:04): chatter is text of another world

Chatter is not only to be ignored: it may be requests of ANOTHER world. A VSA world's reading should return, besides its
formalizations, the ZONES of the text that make no sense for it, so that the system can try them in another VSA world (worlds share
common words). So:
- every design outputs the unexplained zones explicitly (token spans), not just drops them; measure zone extraction (exact-span F1 of
  the chatter zones against the gold);
- E5 (new): two synthetic worlds with partly shared vocabulary (the diagram world and a second one, e.g. a calendar/shopping world with
  its own actions and roles); messages mix requests of both worlds plus pure chatter. World A reads its requests and hands back its
  zones; world B reads those zones. Measure: requests of each world read right, requests of B wrongly read by A (and vice versa), pure
  chatter left over. Threshold: >= 80% of B's requests recovered from A's zones on the gold-cut-level accuracy of B. See vss-demo's
  "dispatcher by fit over several worlds" and negative examples (R81) for prior mechanisms (training/vss/tool/sop, notes in
  /home/claude/vss-demo).
