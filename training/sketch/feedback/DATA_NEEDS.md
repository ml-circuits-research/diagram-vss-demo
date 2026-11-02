# DATA_NEEDS: VSS says what data it needs, from unlabelled text (2026-11-02)

The owner's goal (2026-11-02 18:56): a more explainable model that says when it is not sure and what data it needs, without using VSS's own
feedback to train it. This note turns VSS's own reasons for doubt into a ranked list of data to write. It reads only the text of the messages.
Gold labels are used only afterwards, to check whether the list points at VSS's real losses. No model, reader or data file was changed.

## 1. Method

Tool: `training/sketch/feedback/data_needs.mjs`. It runs the default composer (`docs/model/micro/registry.json`, loaded as the demo loads it)
on each message, with no canvas names (only the `text` field). It collects every request VSS is not sure of or cannot read, with the cause
VSS gives:

| what VSS produced | causes taken from it |
|---|---|
| A request whose combined confidence (`docs/js/vss-confidence.js`, model `docs/model/confidence/vss.json`) is under the 97% threshold (0.9113, the demo's default) | The groups of `reasons()` (cut, world, words, unplaced, reading, context, prior), each expanded with the composer's outputs: words of kind "unknown" in the chosen world (`unknown-word`); words placed in no role, by kind (`unplaced`); known words left unread (`words-left`); the residual (`residual`); the role with the smallest margin when the status is abstain (`close`); the world chosen against the cutter's first choice (`world-vs-cutter`) or close to the second (`world-close`); the world's prior (`prior`); the weakest context fill (`context`); the cut boundary (`cut-start`, `cut-end`) |
| A unit the context filler asked about | `ask`: the action, the role and the reference word (or "empty") |
| A unit no candidate world could read (unknown-event, no-sense) | `unread-unknown`: the first word no candidate world knows, with the event cutter's hint; `unread-known` when every word is known |
| Text outside every unit, cut at . ! ? ; | `cut-missed`: when some world reads the piece (an event and at least one word understood, the composer's own rule), with the action word the front end found |

Each instance gets a key made from these outputs only: the cause, then the unknown word, the kind of the unplaced word, the action read or
hinted, the world, the role, or the boundary word. Instances with the same key make one need. A need has a count of requests (distinct
units), a stage, the most frequent words and local constructions, up to 5 example snippets, and a sentence saying what data to write. The
sentence comes from a fixed template per cause. No example is read to form a group. In the construction, names are written NAME, quoted
texts TEXT, numbers NUM, and legend values by their kind ([COLOR], [SHAPE]...).

Commands (one node process at a time, about 850 MB; 20 s for 195 messages, 2.5 min for 1000):

```
node training/sketch/feedback/data_needs.mjs --split cal --out needs.json --md needs.md training/sketch/llm_bench/fresh2/opus_{a,b,c,d}
node training/sketch/feedback/validate_needs.mjs [--causes composer_errors.json] [--only c1,c2] needs.json records.jsonl <dirs>
node training/sketch/feedback/stage_rates.mjs needs_a.json needs_b.json
```

`--split cal` keeps the fresh2 calibration part (`int(sha256(id),16) % 3 == 0`). The filter is applied to the id while the lines are parsed,
before any text is used, so no test-part message was read. `validate_needs.mjs` takes the gold outcome of every requested action from
`fresh2/collect_vss.mjs` records (the same composer, with canvas names, as evaluated). Optionally it also takes the first root cause of every
miss from `composer_errors.mjs --json`. A gold request is "touched" by a need when one of the need's instances overlaps its gold span by at
least one character. Outputs of this run (scratchpad, not committed): `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/dn/`
(`cal_needs.{json,md}`, `sample_needs.{json,md}`, `val_cal.md`, `val_sample.md`, the records and the root-cause files).

Changes made after the first validation run did not change any instance, key or count:
- a bug in `validate_needs.mjs` (a request touched by no need counted as covered at N = all) was fixed;
- wording of the need sentences and the display of names in constructions;
- a summary by cause in the markdown output;
- the `--only` option.

No threshold for "informative" was registered before the run, so the numbers below describe the result; they do not pass or fail a test.

## 2. Validation (gold used only to check)

Calibration part: 195 messages, 596 requested actions (right 386, wrong 101, not done 109). Sample: 1000 messages, 4858 (3747 / 534 / 577).
VSS without canvas names in the tool; the gold run uses them, as in FRESH2_RESULT.md (calibration 64.8 / 16.9 / 18.3, sample 77.1 / 11.0 / 11.9).

### 2.1 Coverage of the misses by the top N needs (ranked by requests)

| top N needs | wrong + not done touched, calibration · sample | right requests touched, calibration · sample |
|---|---|---|
| 10 | 32.4% · 36.8% | 32.9% · 25.9% |
| 20 | 37.1% · 43.5% | 41.5% · 37.5% |
| 50 | 49.0% · 56.8% | 55.7% · 53.3% |
| all (501 · 1589) | 91.4% · 96.2% | 72.0% · 68.6% |

The top needs touch right requests about as often as wrong ones. The ranking by count is led by broad causes that VSS names for most of its
doubted requests. The largest is "the links world is often wrong" (80 of the 371 doubted requests on calibration), followed by the residual and
the words left unread. VSS is not sure of 77% of its requests on calibration and 71% on the sample (371 of 484, 3032 of 4245). So "all needs"
touches most requests, right ones too. The top-N needs see the wrong requests (53.5% at N = 10) far better than the not-done ones (12.8%).

### 2.2 Which causes point at failures (all needs; share of misses touched / share of right requests touched)

| cause | misses touched, calibration · sample | right touched, calibration · sample |
|---|---|---|
| cut-missed (text outside every unit that a world reads) | 25.7 · 21.2 | 6.5 · 3.5 |
| ask (the context filler asks) | 18.6 · 22.1 | 2.3 · 2.9 |
| world-vs-cutter | 8.1 · 7.8 | 2.3 · 1.1 |
| unread-unknown / unread-known | 1.9 / 1.4 · 1.6 / 0.8 | 0.8 / 0.0 · 0.6 / 0.0 |
| unplaced (a known word in no role) | 13.3 · 11.4 | 8.3 · 5.0 |
| unknown-word | 17.1 · 15.4 | 12.2 · 11.2 |
| close (smallest margin) | 12.4 · 16.4 | 11.1 · 9.5 |
| context (weak fill) | 7.6 · 7.0 | 5.7 · 4.6 |
| residual | 21.9 · 26.5 | 23.3 · 16.9 |
| prior (world often wrong) | 22.4 · 32.8 | 32.1 · 31.4 |
| words-left | 12.9 · 20.5 | 16.8 · 20.6 |
| cut-start | 19.0 · 13.8 | 18.4 · 15.8 |
| world-close | 6.2 · 4.1 | 12.2 · 9.1 |

The same pattern holds on both sets. The causes about what VSS could not do (cut-missed, ask, world-vs-cutter, unread) and the unplaced words
are specific to failures. Prior, residual, words left unread, the cut start and world-close are not. Counted together (this subset was chosen
after seeing the two tables above, so it is descriptive), the 190 needs of cut-missed, ask, world-vs-cutter, unread and unplaced touch:
- calibration: 63.8% of the misses (83.5% of the not-done ones) and 19.4% of the right requests;
- sample: 59.9% (80.4% of not done) and 13.0% of right.

The top 10 of these specific needs alone touch 11.9% of the misses and 5.7% of the right requests (sample 12.5% / 4.6%). They are many
small groups: 95 different cut-missed needs on calibration (one per action word and action), 26 ask needs, 39 unplaced needs.

### 2.3 The root cause of each miss (composer_errors.mjs, gold) against the needs (text only)

| root cause (gold), calibration | misses · touched by any need | the need cause that sees it |
|---|---|---|
| cut: request lost (no unit) | 35 · 29 | cut-missed 29 |
| roles: the key holds the gold values and more | 28 · 23 | prior (links) 17, words-left 8, residual 5 |
| filler asked | 25 · 25 | ask 25 |
| event: the gold world read another event | 20 · 19 | broad causes only (residual, words-left, cut-start, unplaced 5 each) |
| front end: a value is not a token | 20 · 20 | prior 12, residual 9, unknown-word 9 |
| cut short | 16 · 13 | cut-start 9, cut-missed 8 |
| filler filled wrong | 11 · 10 | context 6 |
| unknown-event (no action word) | 10 · 9 | unread 5, world-vs-cutter 2 |
| roles: value in no role | 8 · 8 | unplaced 8 |
| another world won | 6 · 6 | world-vs-cutter 5 |

On the sample the matches repeat:
- lost: 128 of 146 touched, 127 by cut-missed;
- filler asked: 149 of 151, 146 by ask;
- another world won: 65 of 65, 49 by world-vs-cutter;
- filler filled wrong: 70 of 70, 37 by context;
- unknown-event: 29 of 30, 18 by unread.

A wrong event and a value the front end does not turn into a token are seen only through broad causes. VSS's reasons do not say "this
could be another action" or "this value has no token": a reading that is confidently on the wrong event has no doubt to report.

### 2.4 Does the calibration text predict FRESH2_CAUSES.md?

FRESH2_CAUSES.md (another agent, from gold) says which causes grew from the sample to the calibration part. The tool's rates come from text
only, per 100 units and pieces, calibration against sample, with the cause groups fixed in `stage_rates.mjs` before comparing:

| cause group | growth in FRESH2_CAUSES.md (per 100 requests) | growth seen by the tool, text only (per 100 units) |
|---|---|---|
| cutter | +4.3 (largest) | +7.1 (largest; cut-missed 23.1 → 28.5) |
| roles | +4.0 | 0.0 as a group; unplaced 5.6 → 9.2, residual 15.3 → 18.1, words-left 16.4 → 12.0 |
| event / world | +2.2 | −0.1 as a group; world-vs-cutter 2.2 → 3.6, unread 0.9 → 1.9, prior 25.8 → 22.2 |
| references | +1.4 | +1.7 (ask 6.4 → 7.1, context 4.2 → 5.2) |
| front end | +0.3 | +1.4 (unknown-word 11.1 → 14.6) |

Its single causes, against the calibration needs:

| FRESH2_CAUSES.md finding | found by the tool from the text? |
|---|---|
| Cutter loses requests (terse, mid-message, delete forms) | Yes, as the largest rising cause (cut-missed). Delete forms only weakly: 3 instances |
| Connect "A to B" / "A and B to C" puts both names in `from` | Yes: needs 5, 6, 16 (connect with "to", "and" left unread, a name in no role) and 32 (`targets` close). The filler also finds `from` empty in 18 doubted links requests |
| Event confusions (list / neighbors, arrange / move, rule / set) | Weakly: close-on-event needs (set 5, rule 2, align 2) and world-close needs; no need names the confused pair |
| Pronoun "them" asked | Yes: ask needs for "them" (set, connect, move, swap) |
| Vocabulary: "labelled", "hmm", "same", typos (brwon, cirlce, rigth, insted, thru) | Yes, all of these as unknown-word needs, each small, as FRESH2_CAUSES.md says (a long flat tail) |
| Unknown words grew but are not a cause | The tool sees the growth (unknown-word +3.5) and cannot tell that it costs little; the check in 2.2 can |

## 3. Answer in plain words

Yes, VSS can say from the text alone where it loses requests, and for the causes about what it could not do, it says it well. These causes
are text the cutter left out that a world can read, a reference it asks about, a world chosen against the cutter, words it placed in no role,
and units with no action word. Their needs cover about 60% of the misses on both sets, about 80% of the not-done requests, while touching
13-19% of the right ones, and each matches its gold root cause.

The ranking by count does not show this. Its top is held by broad doubts that VSS raises for most requests: the links world's weak prior,
the residual, function words left unread. These touch right and wrong requests alike, so the top 10 needs cover a third of the misses (32% and 37%) and
a quarter to a third of the right requests (33% and 26%). Two limits are VSS's own. A wrong action read with confidence leaves no doubt to report. A cut-missed piece may
be a lost request or a comment the front end misreads; text alone cannot settle which, so those needs ask for annotation, not for a rule.

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

## 5. Could SOP-BERT produce the same list?

SOP-BERT has these signals per request (`precision_bert_collect.mjs features`):
- the act head's probability, margin and entropy;
- each key head's probability;
- per word, the probability of its role tag (including "no role");
- the span head's B / I / O probabilities.

From them it could make a list of the same shape, grouped mechanically:
- "act uncertain between connect and move on spans that start with X";
- "the `to` key uncertain";
- "word w tagged with a low-probability role" (close to VSS's unplaced words);
- "span start uncertain at w" (close to VSS's cut-start).

Its confidence also transferred better to the new writer (FRESH2_RESULT.md), so its list of where it doubts may be the more accurate one.

What its signals cannot say:
- That a word was never seen. WordPiece splits every word into known pieces, so no "unknown" word exists.
- Which words the reading accounted for and which it left over. There is no residual and no lexicon of kinds.
- Which stage failed (cut, world, reader, filler). It is one network, apart from the span head.
- Whether the gap is a missing word or a missing construction.

A list from SOP-BERT would therefore name where and which output it doubts, but not what is missing from its training data, unless a
separate novelty measure were added (for example the distance of a span's embedding to the training spans). That is a new component, not
a signal it has. VSS's list names the word, the stage and the action because its pipeline has discrete learned parts. As section 2 shows,
only some of those names point at real failures.
