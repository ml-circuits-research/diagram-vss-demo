# C. What the existing VSS reader already has, and where attention (centres + soft weights) would plug in

Reading task only. No code changed, nothing run, nothing committed. Paths:
- `V8` = /home/claude/diagram-vss-demo/training/vss/experiment/v8_gates.py
- `INF` = /home/claude/diagram-vss-demo/training/vss/tool/sop/infer.py
- `TR` = .../tool/sop/train.py, `WORLD` = .../tool/sop/world.py, `LEG` = .../tool/sop/legend.py
- `RB.js` = /home/claude/diagram-vss-demo/docs/js/vss/routebook.js, `RD.js` = .../docs/js/vss/reader.js
- notes: /home/claude/vss-demo/experiment/RESULTS.md (identical copy in ml-circuits-research/vsa-semantic-space/experiment/RESULTS.md),
  /home/claude/diagram-vss-demo/training/sketch/EXPERIMENT_BOUNDARIES.md (`EB`), /home/claude/vss-demo/vision/*.md

I did not read all of RESULTS.md (thousands of lines); I read the sections found by grep (9c-quinquies, vorder, WikiSQL). Statements about
results are limited to those.

## 1. How the reader's state is built today

### 1.1 Stars, kinds, target
- Star = fixed random phase vector per word (identity), per role (`role:<id>`), per operator (`op:<name>`): WORLD `Stars` (l.58-95). Never learned.
- Kind (category) of a word: from the lexicon `kinds.tsv` (LEG `_load_lexicon` l.95-103, `kind()` l.106-111), else "unknown". Kinds are the
  only input of the learned address (training: TR l.426-433; inference: INF `encode` l.200-209). The word's identity enters only through its star.
- State of a sentence: `S = sum_k address_k (x) star(word_k)` (V8 `states` l.60-106, last line 106; numpy twin `Routebook.addresses`
  INF l.69-105 + `Reader.chart` INF l.210-214; JS twins RB.js l.23-100 and RD.js).
- Target of a training row: `Compiler.wire` WORLD l.242-287 = pred-key (x) verb star + sum over roles (role key (x) (filler + occupancy marker)),
  entities nest (head, attr, det), `and` = ordered items with `op:and.next**i`. ONE wire = ONE target per row. TR l.446:
  `targets = comp.wire(train[i]["wire"], ...)`. Loss = -cos(S, target) (trainer.py l.41-42, V8 `train` l.118-120).
- Rows: `load_rows` TR l.54-77 makes one row per top-level wire with its own `_text`: the existing data is "one text = one request".

### 1.2 Route book codes (address = sum of terms; each term is a phase vector exp(i theta))
| code | what it computes | learned parameters | where |
|---|---|---|---|
| path | cumulative sum of one learned phase per kind: `E(cumsum(th[path[cat]]))` (a "how far did I walk through kinds" address) | K x D | V8 l.64-65; INF l.72; RB.js l.28-31 |
| bigram | phase keyed by (previous kind, own kind); `bg0` for the first word | K x K x D | V8 l.66-67; INF l.73 |
| chainL | soft "expectation chain". Gate g_c = sigmoid(logit_c) = probability that a word of kind c is an emitter. Right address: word k takes the expectation of the most recent open emitter q: `p(q,k) = g_q prod_{q<i<k}(1-g_i)`, `addr_k = p_root + sum_q p(q,k) addr_q (x) exp(i A[c_q,c_k])`. Left re-addressing (v6): a non-emitter is re-addressed by the first open emitter AFTER it with `L[c_q,c_k]`; `final_k = g_k addr_k + (1-g_k) addrL_k` | A, L: K x K x D; gates K | V8 l.72-96; INF l.78-97; RB.js l.47-82 |
| vorder (verb order) | every non-verb word drawn a second time at a learned phase keyed by (side of nearest verb, verb kind, own kind, ordinal among bare words of its kind since that verb, clamped to nmax=4); words introduced by a role cue are left to chainL ("variant b") | 2 x K x K x nmax x D | V8 `set_vorder` l.123-141, `vorder_index` l.143-164, use l.97-100; INF l.51-67, 98-100; RB.js l.85-97 |
| pos (position) | `exp(i(pos[i] + pc[cat]))`, positions clamped at 39, term omitted beyond the trained length | 40 x D + K x D | V8 l.41-45, 68-71; INF l.74-77 |
| beacon-relative | see 1.4 | K x D | V8 l.101-105, 166-177 |
- Bundle used by every diagram model in `docs/model/*/model.json`: `codes = [path, chainL, bigram]`, `rel_emitters = null`, `residual = "explained"`,
  `candidates = "sentence"` (I read all ten: A_p25, B_p25, final_p20, final_p40, learned_p25, real, real_p25/50/100, sketch). So vorder, pos and
  rel are NOT in the shipped diagram readers; vorder was a candidate (vss-demo `app/model/diagram` has `activation.candidates ["vorder"]`) and is
  documented as switched on/off per world by a person (ACTIVATION_rules_and_worlds_2026-10-26.md l.9-10, 53-67; reference world: FULL 0.869 -> 0.892
  with vorder, "seen transitions 0.526 -> 0.789", l.104).

### 1.3 Gates
- Learned: one logit per kind, init -2 ("closed start", g=0.12), trained with the same Adam as the phases (V8 l.49-50; TR l.453, 457 `params=[theta, logits]`).
  Experiment v8_gates (the file's purpose, l.1-25): do the gates found by hand/search emerge from the single objective? Variants hand / learned-closed /
  learned-open / chainL alone.
- Given: legend `reader.gates_given {open, closed}` -> `fix_gates` (V8 l.179-185: logit +-8, gradient masked via hook; TR l.458-460; LEG l.66-70
  validation). In the diagram readers: open = to, from, of, in, on, at, by, with, into, as, and, "," (sketch/model.json `legend.reader.gates_given`;
  vss-demo diagram also "."). So in the diagram world the gates are GIVEN for prepositions/connectives and learned for the rest.
- Gate also drives `depth_from_gates` (INF l.319-328) for the reporting-verb worlds.

### 1.4 Beacon-relative emitters (rel_emitters / set_rel_emitters / takers)
- Computes: a word of an emitter kind draws the NEXT word, if its kind is a taker, a second time at (the taker's own address) (x) exp(i REL[c_emitter])
  (x) star_taker. `sel[k] = rel_mask[c_{k-1}] * taker_mask[c_k]`; `terms += sel * terms * E(rel[c_{k-1}])` (V8 l.101-105; INF l.101-104; RB.js l.101-110).
  It does not move the cumulative position of the probe; it is "a word star at an address relative to the taker's own slot" (docstring V8 l.166-170).
- Training: the emitter and taker kind sets are GIVEN by the legend (`reader.rel_emitters {emitters, takers}`, LEG l.20, 73-75; TR l.466-468); only the
  displacement REL (K x D, init 0) is learned, in the same loss. Exported in the route book (TR l.387-388).
- Worlds/results: only the quantifier world (v14 `--rel`, RESULTS.md section 9c-quinquies l.837-870): determiner as emitter, noun as taker.
  One quantifier: scope at the unseen depth 0.998 (slot target) / 0.927 (noun target) vs 0.67/0.63 without (C2 gates open); depth-0 nouns 0.998.
  Two quantifiers: NOT met (0.69/0.87 at depth 0, 0.46-0.48 at depth 2); the trace says one displacement per category cannot express "which of two
  determiners is wide", a relation between two words (l.862-868). Not used in any diagram model (all ten have `rel_emitters = null`).
- Relevance: it is the only existing mechanism where the address of one word is defined relative to ANOTHER word (an offset from a beacon), but the
  relation is hard-wired to the immediate next word and to kind sets.

### 1.5 Where "several" already exists inside one state
- `and` wire: ordered items `op:and.next**i` (WORLD l.280-285).
- WikiSQL (`v11_wikisql.py` docstring): `sum_k COND_k (x) [COL (x) ... + OP + VAL]`, several conditions in ONE state keyed by a slot index; set roles at
  readout (INF `read_set_role` l.239-257: every table column whose ratio >= threshold is a member). Reported weakness: the second and later conditions
  are the ones the reader misses (RESULTS.md l.1314, 1425: "a frame with two or three conditions compounds it", presence 0.89 per slot).
- These are several FILLERS of one predicate, not several predicates.

## 2. Was "several predicates / states per input / multi-request / attention between words" tried?

- Several predicates in one state: NOT in the older repos. Every old world is one request per input (WikiSQL: one question -> one query; SNIPS: one
  intent; reference world: one event, optionally nested under `says`). EB l.44-45 states this explicitly. Nested reporting ("A says that B says that ...")
  is depth of ONE event (v7_nested, `says.scope`), not several events. Operators `then`, `but`, `so`, `because` exist in LEG l.15 for a circuit of
  separate states, "the links live in the circuit"; the segmenter (spec section 15, vision/VSS_Diagram_Editor_Specification.md l.446-452, 612) cuts
  the input BEFORE the reader at punctuation / "and" / "then" and each unit gets its own state.
- Attention between words: never as a mechanism. The nearest things are chainL (a word's address is derived from a soft choice of earlier/later
  emitters, a "soft pointer" restricted by gates and kind pairs, not content-based) and vorder. I found no `attention` mechanism in the experiment files
  (grep over experiment/*.py and the notes).
- The first multi-centre experiment in this repo (2026-10-31, EB, model final_p40, 1126 requests of the dev split):
  | method | wires right | extra wires |
  |---|---|---|
  | annotated spans (perfect cut) | 52.2% | 80 |
  | learned tagger cut | 50.4% | 90 |
  | VSS centres (`docs/js/vss-centers.js`), content words only | 41.7% | 290 |
  | same, centres whose reading abstains dropped | 38.5% | 289 |
  Exact-span F1 of the cut: tagger 0.92, vss-centers 0.34, vss-segment 0.24 (threshold 0.85, stopped, no tuning; the later "weight tuned on the
  fly to 0.38" was ruled wrong in AGENTS.md "Experiments").
  Causes named in EB: (i) on the gold spans the reader places every word in only 67% of the requests (93/138; 44 abstain, 5 no event): "explained" is a
  weak signal; (ii) centres come from learned trigger words so chatter fires some and some actions are missed. The reader was trained on single
  requests to place role words, not to explain everything, and never to be given a window larger than one request.
- Mechanics of that experiment (relevant to cost): for each centre, every stretch [a,b] containing it and no other centre is read by the whole VSS
  reader, scored `(#content tokens placed) - (#unplaced)`, DP over centres (vss-centers.js l.44-82). Hard assignment, no learned weights.

## 3. The signals that say whether a word belongs to a state

All computed per SENTENCE (= per state) in `Reader.formalize` INF l.631-735 (JS twin RD.js l.560-645).

- **chart / state S**: sum over kept tokens of `addr_k (x) star` (INF l.210-214). `kept` excludes tokens whose kind is not in the route book.
- **core / structure score** `core`: mean top cosine of the always-present (core) roles and of the predicate (`structure_score` INF l.231-237;
  `read` l.366). It is the denominator of every presence ratio.
- **margin**: top1 - top2 cosine over the candidates (`best` INF l.217-223). Per role: `margins[r] = min(identity margin, presence margin)`
  (l.395). Event margin l.376; structure margin = best depth hypothesis minus second (l.365).
- **presence ratio**: for a role, (cosine of the occupancy marker or best candidate after unbinding the role) / core (`read_role` l.267-275);
  present if ratio >= per-role threshold fitted on calibration rows = training sentences (TR `calibrate` l.511-556, thresholds `presence`,
  `attr_presence`, `det_presence`, `set_member`; fit rule l.557-558). `presence_margin = |ratio - thr|`.
- **abstain**: status "abstain" when `min(margins) < tau` (INF l.704; tau stated 0.05, TR l.496, not fitted).
  "unknown-event" when frame shape not ok or no verb (l.696); "no-sense" when unplaced tokens > `no_sense_share` (0.5) of all tokens (l.695).
- **placed**: `placed_words` (INF l.625-629) = speakers + event lemma + all filler words of the decoded roles.
- **unplaced**: unknown-kind tokens plus content-kind tokens that are not placed (INF l.674-678). Written as `_unplaced`. Content kinds =
  schema `content_kinds`, derived from the annotated data (TR `content_kinds_of` l.80). This is what vss-centers.js counts.
- **residual, compiled** (`residual` INF l.576-581): `||S_n - a * rec_n||` with rec = Compiler state of the decoded frame; grows with sentence length
  because rec lacks the route deposits of all words.
- **residual, explained** (`residual_explained` INF l.590-604; the diagram readers use it, `config.residual = "explained"`): rec' = the reader's OWN
  chart of the explained tokens only (placed fillers, event, and every token whose kind is not a content kind); 0 when everything is explained; 1.0
  if no token is explained or if `frame_incomplete` (a required/core role missing, l.583-588, 710). It is a global scalar per state, not per word.
- **second pass without placed words** (`presence_without_placed`, INF l.645-659): subtract the deposits of placed words from S and re-read the empty
  roles; the only place where the state is edited word by word.
- **one-to-one rule** (INF l.409-446): a word may fill at most as many roles as it occurs; colliding roles keep the larger margin. A form of competition
  between roles for words, hard, post hoc.
- **no-fit residual / dispatcher** (INF l.542-546, 746-775): across several WORLD readers the smallest relative residual wins; `no_fit_residual` 0.9
  stated. This is the only existing "which model explains this input" arbitration (per input, not per word).

There is NO per-word score "this word belongs to this state". The nearest per-word quantities are: placed (0/1, from the decode), unplaced
(0/1), `addr[j] (x) star` terms of S (computable, used in the second pass and in `residual_explained`), and for a given role the cosine of one candidate.
The EB experiment showed placed/unplaced is too weak (67% of gold requests fully placed).

## 4. Where to add (a) centre-relative addresses and (b) learned soft weights

### 4.1 Natural places (all additive; old paths unchanged when no centres are given)
(a) Centre-relative addresses.
- Train side: new `V8.states_centred(cats, ids, mask, centres)` next to `states` (V8 after l.106). Reuse the code terms but restart the walk at the centre:
  path = cumsum of kind phases from the centre outwards, one pass to the right and one to the left (two sign conventions or a side bit); bigram
  unchanged (it is already local); chainL: the centre plays the role of the root (`p_root`), i.e. replace `Sx` prefix-from-sentence-start by
  prefix-from-centre. `set_vorder` is the closest existing form: it already keys addresses by "nearest verb, side, ordinal" (V8 l.143-164); a centre-relative
  path is that idea with the cumulative kind-walk instead of a bare ordinal.
- Inference side: `Routebook.addresses(c)` (INF l.69-105) gets an optional `centre` argument; `Reader.chart` (l.210-214) is called once per centre; same in
  RB.js `addresses(c)` (l.23-100) and RD.js `chart`.
(b) Learned soft weight of word i for centre c.
- `w_ic = sigmoid(u[kind_i, kind_c, bucket(i-c)] + sep terms + b)`; parameters: small table of size K x K x nbuckets plus a few scalars. State
  `S_c = sum_i w_ic * addr_ic * star_i` (V8 l.106 changes from `(terms * F[ids] * mask).sum(1)` to the same with a B x C x T weight).
  A learned "null" centre (state with no target) absorbs chatter. The gates machinery (V8 l.49-50, 72-96) is the template: per-kind logits, sigmoid,
  trained by the same Adam; nothing else in the optimiser changes.
- Decode: `Reader.formalize` (INF l.631-735) loop over centres; for each, `read` (l.336) with `S_c`; per-word membership = max_c w_ic; a word with
  low membership everywhere is chatter (replaces "unplaced" as chatter test); keep `tau`, presence thresholds, margins unchanged per state.

### 4.2 What changes in training (targets per request)
- Data: a training row becomes a MESSAGE with k wires (`load_rows` TR l.54-77 currently creates a row per top-level wire; add a mode that groups wires of
  one `_text`, or concatenates several rows as synthetic messages) and, for each wire, its centre = the position of the trigger token
  (already available: `Compiler.lemma_for`, WORLD l.209-214 finds the first token whose lemma is a verb of the event; with `_verb` set explicitly).
  Per-word gold membership is NOT needed for the first version: the per-request target alone supervises the weights (end to end), as in the plan's E2.
  Optional extra loss: gold membership from annotated spans (the data has spans, EB uses them).
- Loss: `targets` becomes B x C x D with a mask; loss = -mean over valid centres of cos(S_c, target_c) (trainer.py l.41-42 sums over B only;
  needs a masked mean). Chatter centres (false triggers) have no target: either excluded or pushed to the null centre; this is the new design choice,
  and where the EB failure (chatter becomes centres) would be fought.
- Negative examples exist already (R81, target = minus state, TR l.446-448): the same trick supplies targets for false centres ("this is a draw of
  the map" -> minus the create state).
- Calibration (`calibrate` TR l.511-556) must be run per centre on training messages; thresholds stay per role.
- `Trimmed`/length buckets (TR l.396-404) still work (batch cut to longest message).

### 4.3 What changes in the browser reader
- RB.js `addresses`: add the centre-relative variant (about the same loop structure; ~40-60 lines). RD.js: `chart(tokens)` -> per-centre charts,
  the loop in `formalize` (l.~560-645) over centres, aggregation of unplaced/membership, one wire set per centre, residual per centre plus a message-level
  residual (~100-150 lines). `vss-centers.js` (84 lines) would shrink to "find centres" (the DP over stretches disappears).
- Export: the route book gains a few arrays (weight table, null-centre parameters, side bits) in `export_routebook` TR l.379-393 and `model.json`
  bits; `routebook.js` loader reads them.
- Rough size: python training/model ~150-250 lines (new states method, loss mask, grouped data), numpy inference ~100, JS ~150-200, data/annotation
  glue ~100, plus one retraining of the diagram models and a parity check numpy-vs-torch (TR l.500-507 already asserts it) and JS parity.
  That is a one-person few-days change on code, plus the experiment; the synthetic-world prototype of the plan needs none of it.

## 5. Linearity (new requirement: texts up to ~1M tokens, no all-pairs attention)

T = tokens, D = vector dimension, K = number of kinds, V = distinct words in the text, R = number of roles.

| mechanism | time | memory | linear in T? | what breaks / grows on very long input |
|---|---|---|---|---|
| stars (hash -> phases) | O(D) per word | cache of V words | yes | cache grows with V only |
| kind lookup | O(1)/token | - | yes | - |
| path | O(T D) (cumsum) | O(T D) | yes | the cumulative phase is a global running walk: after 10^5 words the address of a word is a pseudo-random point with no locality; fine for equality of kinds paths but not a "distance"; it never resets, so what is read is path position from the start of the text, which has no meaning for the end |
| bigram | O(T D) | O(T D) | yes | nothing |
| pos | O(T D) | O(T D) | yes | clamped at 39 and omitted beyond the trained length (V8 l.68-71, INF l.74-77): words after position 39 get no position; not usable |
| chainL | **O(T^2 D)** as written: V8 l.75 builds `EA` of size B x T x T x D, loops over k with `einsum` over all q<k (l.77-82, 87-93); INF l.80-97 same loops; RB.js l.52-75 double loop | **O(T^2 D)** in training (EA, EL), O(T D) at inference | **no** | at T=10^6 impossible. But `p(q,k) = g_q prod_{q<i<k}(1-g_i)` is a product that decays exponentially with the number of open emitters between q and k, so it factorizes: `R_c(k+1) = (1-g_k) R_c(k) + [c_k=c] g_k addr_k` is a scan per kind c, giving O(T K D) time and O(K D) state (right pass), and the mirror scan right-to-left for the left re-addressing. This is my derivation from the formulas (V8 l.78-82, 88-93); NOT implemented or tested here. Also: with no open gates (all closed), `p_root` is the whole mass for all k, which is the sequence-start address and again carries no local meaning |
| gates | O(K) params, O(T) lookup | - | yes | nothing; learned gates are per kind, not per position |
| vorder, torch | `vorder_index` V8 l.143-164: cummax/cummin/cumsum of a B x T x K one-hot | O(T K) | yes | memory T x K ints; ordinals clamp at nmax-1 = 3 so far words share an address; "side 0" (no verb on the left) counts ordinals from the sentence START (l.162) and is keyed by the nearest verb on the right: meaningless on a text with thousands of verbs |
| vorder, numpy / JS | INF l.51-67: for each k it scans `verbs` and `range(j+1,k)` -> O(T V + T^2) worst case; RB.js l.87-93 `verbs.find`, inner loop over `i` | O(T) | **no (as written)**, easily made linear with the cumulative counts the torch version uses | long runs of one kind between verbs make the ordinal loop quadratic |
| beacon-relative (rel) | O(T D) | O(T D) | yes (adjacent pair only) | local by construction; cannot express a relation between two non-adjacent words (the two-quantifier failure) |
| state S = sum of terms | O(T D) | O(D) if accumulated, but `chart` returns the full `addr` (INF l.214) = O(T D) complex (16 bytes x D x T: ~16 GB at T=10^6, D=1024) | yes in time | **capacity**: one S of dimension D holds a bounded number of terms; the signal of any one term falls like 1/sqrt(number of terms) against the crosstalk of the others. A single state for 10^6 tokens cannot be read; this is why the spec cuts into units before the reader (spec l.612). Even in this repo the calibrated presence ratios and margins were fitted on sentences of ~10-40 tokens |
| readout of one state | per role: cos against candidates, O(R * cands * D) | O(cands D) | independent of T given S, but `candidates="sentence"` makes cands = distinct words of the text (INF l.640-641, 157-173), so O(R V D) per state, and the per-state candidate matrix `M` is rebuilt per distinct filt set (cache key includes `frozenset(filt)`, l.167) | with one huge state, V is large and margins collapse (more competitors, more crosstalk) |
| structure hypotheses (depth) | O(#hyps R cands D) | - | independent of T | - |
| `one_to_one` | `occ(h)` = count over all tokens per head, up to 5 rounds x roles (INF l.416) | O(T) | O(R T) per state, effectively linear | fine per request, wasteful per text |
| placed / unplaced | O(T) sets; `lemma_for` scans tokens (WORLD l.209-214) | O(T) | yes | - |
| residual compiled | `Compiler.wire` O(frame) + `lemma_for` O(T) | - | yes | grows with sentence length (docstring l.595-596), threshold meaningless on long text |
| residual explained | O(T D) (rebuild rec from the explained subset, l.597-601) | O(T D) | yes in time | one scalar for the whole state; with a million tokens it is ~1 (nearly nothing is explained by one frame) |
| second pass (presence_without_placed) | O(T D) | - | yes | - |
| kind_run spans (INF l.661-670) | for each filler word, scans tokens: O(fillers T) | - | roughly | - |
| status/abstain/no-sense | O(#margins) / O(1) | - | yes | `no_sense_share` = 0.5 of tokens: on a long message full of chatter most tokens are unplaced and the state would be called no-sense; the thresholds are per-sentence |
| `vss-centers.js` (hard centres) | for each centre, all stretches [a,b] around it, each read by the full reader (with chainL O(len^2)), cached by text; l.54-81 | O(stretches) cache | **no**: O(C * len^2) readings per sentence, each O(len^2 D) | cubic-ish per sentence; dies on long text, and cuts at . ! ? only |
| training (`V8.states`) | Python loop over T with O(k) work inside (V8 l.77, 87) | B T^2 D | **no** | T=30 -> fine; T of hundreds -> memory blow up; the learned parameters are K x K x D tables, so what is learned does not depend on T, but training on long texts is not possible with this code |
| centre-relative + soft weights (proposal) | with weights restricted to a window W around each centre: O(T W D) overall; with C proportional to T/L centres per text, O(C W D) | O(C D) states (accumulate, never store T x C) | yes if windowed, local features only (kind pair, signed distance bucket, count of other centres between from prefix counts, separators), one pass to find centres | the "number of other centres between i and c" is a prefix-count difference, so no pairwise table; a dense T x C weight matrix is the all-pairs version and must be avoided. The decay form of chainL (above) already shows how a gated, exponentially decaying influence is computed with a scan instead of a pair table |

Summary for the owner's requirement:
- Linear as built: path, bigram, gates, rel, the sum S, the explained residual, the readout of one state (per fixed S).
- Not linear as built: chainL (T^2 D, in torch, numpy and JS) and its training memory; vorder in numpy/JS (the torch version is linear); the hard
  centres DP; the quadratic training loop. chainL can in principle be made linear by a per-kind scan (derived above, not tested; the loss of exactness
  would be nil only if the formula is kept as is, because p(q,k) factorizes exactly).
- Linear time is not enough: the representation (one superposed state of dimension D) has a capacity limit, so a long text needs many states (one per
  centre or per window) each with bounded content; that is exactly the multi-centre design, and the cost per centre must be bounded by a window.
- Meaningless on long input regardless of cost: the cumulative path/position codes (global walk from the start), `pos` (cap 39), the ordinal of vorder
  side 0, thresholds fitted on sentence-length inputs (presence ratios, residual, tau, no_sense_share).

## 6. Short answers
1. State = sum over words of (path + bigram + soft chainL [+ vorder, pos, rel]) address (x) star; gates per kind learned (or given open for
   prepositions in the diagram models); rel (beacon-relative) exists but is used only in the quantifier world (one quantifier 0.93-1.00 at the unseen
   depth, two quantifiers not met); no diagram model uses rel or vorder.
2. Several predicates/states per input and attention were never tested in the old repos (one request per input); the only test is the 2026-10-31
   hard-centres experiment: 41.7% vs 52.2% with a perfect cut, about 200 extra commands from chatter.
3. Per-state signals: margins, presence ratios, unplaced/placed, compiled/explained residual, abstain (min margin < tau 0.05), no-sense; none is per
   word per centre.
4. Plug-in points: new `V8.states_centred` (V8 after l.106) for centre-relative addresses, a per-kind-pair-distance sigmoid weight in the same
   function, targets k per message (TR l.446, `load_rows` l.54-77), `Routebook.addresses`/`Reader.chart`/`formalize` per centre (INF l.69, 210, 631),
   and the same three places in RB.js/RD.js. Roughly 400-700 lines across Python and JS plus a retrain.

## 7. Several worlds: what exists, and how a world could hand back the text it cannot explain (added on request)

Caveat: the experiments that measured the dispatcher and the negative examples on real data (SNIPS, seven per-intent worlds; R72, R75, R79,
R81, R90, R92, R94) were run in the vss-vs-bert repository, which is NOT on this machine (searched). Here I have only the code copied into
vss-demo / diagram-vss-demo and the notes that cite those runs. I can therefore give mechanism and file:line, but not those repositories' numbers.

### 7.1 Dispatcher by fit (world-level vote)
- Code: `formalize_text` INF l.746-775 (also vss-demo/tool/sop/infer.py). Every reader (one per world: its own legend, lexicon, route book, stars
  for role/operator vectors; word stars are global, README "Word stars are global") reads the same line. Per reader, the sort key (l.762) is
  `(status in {no-sense, unknown-event}, relative residual, -mean margin)`; relative residual = `residual / no_fit_residual` (l.760), using the
  refusal-pass residual when the model has one. Smallest wins.
- Refusal: if the best reader cannot place the sentence or its relative residual >= 1.0 (residual >= 0.9, `no_fit_residual`, INF l.542-546, stated and
  not fitted: "unseen depths of a world reach 0.6-0.8, random text 0.99"), output is an `unknown` wire with `_world=none`, `_status=no-sense`, all
  tokens in `_unplaced` (l.766-769). Otherwise `_world_margin` = gap in relative residual to the runner-up (l.771-772).
- Docs: vss-demo/tool/README.md l.60-63, 164, 171; ACTIVATION_rules_and_worlds_2026-10-26.md l.24-30 ("Level W is the voting... each vote is a
  measured quantity ... the share of the sentence the reading does not explain"). Test: README l.312 ("the dispatcher by fit sends 3 + 3 sentences to
  the right worlds"), smoke readers only. Stated limits (README l.352-353): dispatch strategy 3 (sticky context) not built; the 0.9 constant is not
  calibrated because a world folder has no out-of-world sentences.
- Used in the diagram app? I found no dispatcher call in docs/js (grep: no "dispatch"/"world_margin" outside an unrelated comment in logic.js); the
  shipped diagram readers are single-world. vss-demo responses.md D9 (l.96-127) planned the seven SNIPS worlds as a demo page ("many small worlds
  read fast and the one that explains the request wins; a request outside them is a refusal") and PROPOSAL_object_worlds_sketches (l.13: stroke groups
  read by every object world, dispatcher keeps the one that explains it, refuses when none does).

### 7.2 Negative examples (R81), "one-vs-rest"
- Data: a top-level wire with `_negative=true` is a sentence of ANOTHER world, "written with the anchor role only" (TR l.74-76).
- Training: its target is MINUS the compiled anchor state: `targets = comp.wire(...) * (-1.0 if negative else 1.0)` (TR l.446-448). The loss is the same
  -cos(S, target) (trainer.py l.41-42), so for a foreign sentence it pushes S away from this world's anchor (predicate/anchor key): one-vs-rest.
- Kept out of: calibration rows (TR l.509, "never a negative example"), the schema (TR l.847), evaluation rows (TR l.646).
- Result here: none in this repo's models (vss-demo STATUS.md l.81-85: no frozen example carries `_negative`; 0 files). Results on SNIPS are in
  vss-vs-bert, not available. Granularity is the WHOLE sentence: there is no per-word or per-zone negative.

### 7.3 Refusal readout (R90 / R92 / R94)
- INF l.719-734: if `config.refusal` is set, `formalize` runs a SECOND pass of the same state with decoder keys overridden (e.g. `presence_by_kind:
  false`, so kind-driven filling does not explain foreign words) and optionally its own admission sets (R94: `adm`), and stores its explained residual as
  `residual_refusal` / `_residual.refusal`; the dispatcher uses that value instead of the frame's residual (l.760). Rationale in the comment l.720-722:
  "the refusal is a different question from the frame ... a foreign utterance keeps its charge".
- Related per-state gate: `presence_by_kind` (l.276-286), `no_sense_share` (l.695), `frame_incomplete -> residual 1.0` (l.583-588, 710).

### 7.4 What does NOT exist
- No mechanism that cuts a text into zones and gives each zone to a different world; the dispatcher votes per whole line only.
- No per-word "belongs to world X" score; per-word information is only placed/unplaced (INF l.674-678) and the token terms `addr (x) star`.
- No negative examples at word/zone level; no use of `_negative` in the diagram data (checked: only the vss-demo STATUS note; llm_train data not scanned).
- Stars are global, so a word's identity is the same across worlds, but the kind lexicon and route book are per world: another world must re-derive kinds
  for the zone (its own lexicon), which is natural.

### 7.5 How a world could hand back the zones it cannot explain (design sketch, nothing built or measured)
1. World A reads a message (or one centre/window). It already exports the two things needed: `unplaced` token indices (INF l.674-678, `info["unplaced"]`)
   and the explained residual (l.590-604). With centres (section 4), the zones are the tokens with low membership for every centre of A, plus the unplaced
   content tokens of each of A's states.
2. Group the leftover tokens into maximal contiguous zones (a linear scan over the membership/unplaced flags; punctuation as separator).
3. Hand each zone to the other readers with the existing `formalize_text` / dispatcher (INF l.746-775): each world W_j reads the zone, the relative
   residual (refusal-pass value when available) decides who takes it; `_world=none` means nobody does, i.e. true chatter. The zone's best reader may in
   turn hand back its own unplaced words, with a fixed depth limit (and a rule that a zone never returns to the world that already gave it up).
4. Training the "null" side: R81 already supplies a world-level form: sentences of other worlds with target = minus the anchor. For zones, make the
   negative rows zones (a chatter phrase, or a request of another world embedded in a message) with the same sign flip; the soft weights of section 4
   then learn to give such words weight ~0 for A's centres. The refusal pass (7.3) is the existing readout for "this zone keeps its charge".
5. Calibration: the 0.9 no-fit constant must be fitted on zones, which needs out-of-world zones in the training split (the README names this as the missing
   data); with real messages these exist (chatter, other-world requests) but must come from the annotated training data (AGENTS.md rules on data).
6. Cost: W worlds x (zone length) per zone, W fixed, zones disjoint, so total cost is linear in T provided each world's per-zone read is linear (it is
   not today because of chainL, section 5) and zones are bounded. Total tokens read = T x (1 + depth of hand-backs) at most.
7. Known risks from the existing results: the hard "explained" test is weak (67% of gold requests fully placed, EB l.17-20), and the no-fit residual is a
   stated constant tuned for sentence-length inputs; a zone of a few words has a noisy residual (1.0 whenever a core role is missing, l.583-588, 710). The
   dispatcher has only been exercised on whole sentences.
