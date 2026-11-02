# FRESH2_CAUSES: why the readers lose on the fresh Opus-written set (2026-11-02)

Question: on the 195 calibration messages (596 requested actions) of `llm_bench/fresh2/`, VSS goes from 77.1 right / 11.0 wrong / 11.9 not done
(1000-message sample) to 64.8 / 16.9 / 18.3 (the table in FRESH2_RESULT.md §4 says 58.6 / 18.2 / 23.2 on the test part; the calibration part is
a little better). SOP-BERT shipped goes from 80.8 / 16.5 / 2.8 to 74.2 / 21.8 / 4.0. This note says where the lost requests went. No label,
reader, model or data file was changed.

## How this was done (and what to trust)
- Only the calibration part (`int(sha256(id),16) % 3 == 0`) was analysed: a filter script wrote the 195 messages to a separate folder and every
  tool below read that folder. For the label-drift part, the "open cases" of the four `LABEL_FIXES.md` files were read through a filter that
  withholds every item naming a test-part id. Disclosure: before the filter existed, `opus_a/LABEL_FIXES.md` (whole), the first lines of
  `opus_a/batch_01.jsonl` and the lines of the other LABEL_FIXES files that contain "open case" were printed; nothing in them was analysed.
- VSS: `composer_errors.mjs` on the calibration folder, default registry (its totals equal the records of job 042: 386 right, 101 wrong,
  59 extras). The sample's numbers are from job 032 (`errors_default.txt`). Note: the "sample" holds 4858 requests of which 2167 are in four
  folders VSS did not train on (bench_*: 75.4 right / 11.6 wrong / 13.0 not done) and the rest in training folders. The drop is not a training-leak
  effect: against the untrained part the fall is 75.4 -> 64.8 right.
- SOP-BERT shipped: the 042 records (calibration ids; outcomes identical to mine: 442 right, 130 wrong, 87 extras) plus a re-run of the shipped
  model on the calibration messages, on its old held-out split (585 messages, 1711 requests) and on the sample, to see which key was wrong
  (the records do not keep that).

## 1. VSS: where the 210 lost requests are, and what grew

Per 100 requested actions, the stage of the first cause that explains each miss:

| Cause group | Calibration | Sample |
|---|---|---|
| Cutter: request lost 5.9, trigger word outside unit 1.7, cut short 2.7, merged 0.5 | 10.7 | 6.4 |
| Roles: names put in the wrong role or in none (reading + adapter) | 7.9 | 3.9 |
| Event / world: another event, no action word, another world won | 6.2 | 4.0 |
| References: filler asked (pronoun, empty, vague) or filled wrong | 6.0 | 4.6 |
| Front end: a value is not a token of the unit | 3.4 | 3.1 |
| Pairing, description, other | 1.0 | 0.8 |
| All misses | 35.2 | 22.9 |

The gap is 12.4 points. Growth by group: cutter +4.3, roles +4.0, event/world +2.2, references +1.4, front end +0.3. Extras (requests nobody
asked for) rise from 6.5 to 9.9 per 100 requests.

The single causes that grow most (points per 100 requests):

| Cause | Calibration vs sample | Requests |
|---|---|---|
| Cutter: no unit holds the request ("lost") | 5.9 vs 3.0 (+2.9) | 35 |
| Roles: `from` holds both names of "A to B", "connect A and B", "A goes to B" | 4.7 vs 1.9 (+2.8) | 28 (24 are connect) |
| Event: gold world read another event (list/neighbors, arrange/move, rule/set) | 3.4 vs 1.7 (+1.6) | 20 |
| Filler asked about a pronoun ("them", "both of them") | 2.9 vs 1.3 (+1.5) | 17 |
| Cutter: trigger word outside every unit | 1.7 vs 0.5 (+1.2) | 10 |

What the examples show (calibration messages only):
- Lost requests are terse or verb-less ("Neptune indigo", "dashed arrow Cdn to Origin", "Mail is to the right of Web"), delete forms
  ("delete the triangles", "get rid of Loss", "remove it": 6 of 35, delete is missed 8 times in 10 against 1 in 6 in the sample) and requests in the
  middle of long messages. The cutter was trained on mostly one-style text.
- 24 of the 28 "more" cases are connect: "Merger to Out", "Q0 to Q1 dashed", "Sea dashed to Rail", "Both Legal and Finance go to Close" give
  `from = merger,out`. The reader has no pattern for a bare "A to B" or "A and B to C" without the verb at the front.
- The miss rate is about 34% for messages of every length in the calibration part (under 150 characters 33.6%, 150-400 36.2%, 400-700 34.6%),
  while the sample is 18-24%. So the loss is the writer's style, not message length. Opus mixes very terse messages with long ones; the sample is
  almost all 150-400 characters.

## 2. Vocabulary

| Measure | Calibration | Held-out folders |
|---|---|---|
| Word tokens VSS gives kind "unknown" (not in the 380-word lexicon, in no front-end phrase; names excluded) | 16.0% | 10.9% |
| Word tokens never seen in any training text (6584 messages) | 2.3% | 1.0% |
| Requests whose trigger word no front end or lexicon knows | 4.7% (28 of 596) | 3.0% |
| Gold values that no front end turns into a token | 8.5% (43 of 507) | 8.8% |

"Unknown" is mostly ordinary words VSS saw but gave no kind (also, because, it's, thanks, our): about as common as before and not a cause by
itself. Real never-seen words are rare. Requests whose span contains a never-seen word miss more (VSS 51.7% against 34.4%; SOP-BERT 37.9% against
25.2%) but there are only 29 of them: 15 of the 210 VSS misses (7%). The front-end cause itself hardly grew (3.4 vs 3.1 per 100). The value
measure over-counts (arrow=none, axis, pairing=chain are read by role, not by one token) but it is the same on both sets, so it shows no drift.

Words and phrases most often in missed requests, by count:

| Word or phrase | In missed / in all requests that contain it | What it is |
|---|---|---|
| "same" (same size/green as) | 4 / 4 | a relation the reader has no word for |
| "hmm" (self-correction opener) | 4 / 4 | chat word |
| "labelled" | 4 / 6 | label word spelled the British way |
| "anymore", "hangs", "idea", "rule", "end", "added" | 2 / 2 each | single uses |
| typos: yelow, brwon, cnnect, rigth, cirlce, insted, thru | 1 / 1 each | 7 misses |
| "fig", "kyc", "az", "hdmi" | 2 / 3, 1 / 3, 1 / 2, 1 / 1 | domain names or terms that are not marked as names |

Conclusion: the tail is long and flat, no word or phrase explains more than 4 requests. Vocabulary explains about 15 of the 210 misses.

## 3. Label convention drift

The "open cases" of the label check that name calibration ids are: fo-0169, fo-0154, fo-0327, fo-0528, fo-0489, fo-0567 (items fully visible)
and fo-0178, fo-0235, fo-0380, fo-0423, fo-0580 (items that also name test ids; judged only from the calibration messages).

| Judgement call | VSS | SOP-BERT |
|---|---|---|
| A sentence with no wire (expectation: "Bill before Ship, not after"; "Hub is the middle") read as a request | 0 extras | 2 extras |
| Group words resolved to names in the gold ("swap them", "connect Hub to all four of them", "put them in a circle") | 1 asked | 3 wrong |
| Several `$new` in one wire, one hop per sentence, "connected" or "path" (fo-0154, fo-0567, fo-0489) | 0 | 0 (the misses there have other causes) |

So by the strict count, 1 of the 210 VSS misses and 3 wrong + 2 extras of SOP-BERT's 130 + 87 follow a listed judgement call: label drift
between writers is not a cause of the gap.

A wider effect is not drift but the reference convention itself: the gold writes names that are not in the request's own words ("swap them" ->
Bill,Ship). Requests whose gold names are not all in the span are 10.7% of the calibration part (64) against 7.0% of the sample. VSS misses 38 of
them (23 not done, 15 wrong); SOP-BERT misses 49, 48 of them wrong, because it fills something instead of leaving a reference. By AGENTS.md a
reference the request cannot resolve is not a reader error, so VSS's "not done" is the honest outcome and SOP-BERT's fill is the costly one.

## 4. SOP-BERT shipped

Per 100 requested actions:

| Outcome | Calibration | Old held-out split |
|---|---|---|
| Right | 74.2 | 83.8 |
| Wrong: value (colour, shape, arrow, position, ...) | 5.0 | 5.8 |
| Wrong: description ("all the circles", "the blue one") | 2.2 | 1.8 |
| Wrong: who or what (reads nothing 6.9, something else 6.5, created-shape reference 1.2) | 14.6 | 6.3 |
| Not done (no request of that act produced) | 4.0 | 2.3 |
| Extras (requests nobody asked for) | 14.6 | 5.0 |

On the 1000-message sample the same numbers are 80.8 right, 5.6 value, 1.7 description, 9.2 who or what, 2.8 not done, 7.2 extras.

Values did not get worse. The new losses are the "who or what" keys (+8.3 over the held-out split) and extras (+9.6):

| Extras (per 100 requests) | Calibration | Held-out split |
|---|---|---|
| Text that is not a request (greetings, comments, "Hub is the middle") | 8.4 | 2.2 |
| A second request cut out of one that was done (split) | 3.7 | 1.5 |
| The request there was done as another act | 2.5 | 1.3 |

Of the 100 requests with a wrong "who or what" in the calibration part:
- 47 have gold names that are not in the request's own words (group 25, single 22): the reader filled 27 of them with something else and left 20 open.
- 19 are descriptions; 7 are references to created shapes ($new).
- 27 have the names in the span: 18 single and 9 group. The causes seen are a unit that is too short or too long ("New goes to Assigned"
  cut from a four-step chain, "in a row" as its own unit) and chat words taken as names ("fyi Lan1", "Dock pls", "need").

Act errors show up as 24 not done plus 15 extras of the "done as another act" kind. The cutter is therefore the shared root: for VSS it loses
requests, for SOP-BERT it makes extras and cuts the names off.

## 5. Causes ranked by VSS requests lost (calibration part, 210 lost)

| Cause | Requests | Where it sits |
|---|---|---|
| Cutter: request lost, trigger outside, cut short, merged | 64 | cutter, data coverage (terse, delete, mid-message) |
| Roles: both names in `from`, value in no role, adapter loses it | 47 | world model + adapter, data coverage (bare "A to B") |
| Event / world confusion (list vs neighbors, arrange vs move, rule vs set) | 37 | world, data coverage; part also label convention |
| References: pronoun asked or filled wrong | 36 | filler (a design choice: asking is honest) |
| Front end: value not a token (chain "then", "how many arrows") | 20 | front end (learned phrases), data coverage |
| Pairing, description, other | 6 | scorer pairing, labels |

For SOP-BERT (130 wrong + 87 extras + 24 not done): who-or-what keys 100, extras 87 (50 of them text that is not a request), values 30, descriptions 13
(some overlap with who-or-what by key order), not done 24.

## 6. What would fix each in the long term

| Cause | Fix | Kind |
|---|---|---|
| Cutter loses terse and delete requests, cuts chains short | Train the cutter on whole messages that mix very terse and very long text, with more verb-less and delete forms | more varied training data |
| Bare "A to B" / "A and B to C" puts both names in `from` | Include bare-arrow, "goes to", "A and B to C" forms in the links training data; a rule that the first name of a two-name connect goes to `from` and the rest to `to` is learned from them, not written | training data + learning rule |
| Event confusions (list/neighbors, arrange/move, rule/set) | Add contrastive pairs of these phrasings; the event hint should be re-trained on them | training data |
| Extras from chat text (SOP-BERT) | Train the span head with more non-request sentences: greetings, expectations, comments | training data |
| Names with chat words ("fyi", "pls") | Same data, and names that are not capitalised in running text | training data |
| Pronoun and group references | Keep VSS asking; for SOP-BERT make the fill step leave a reference when the names are not in the unit (27 wrong fills in 47) | learning rule |
| Never-seen words and typos (about 7% of VSS misses) | Production feedback loop adds them; a lexicon entry for synonyms | no retraining |
| Gold writes names the request does not contain | Owner decision: keep resolving groups in the gold (and count VSS "asked" as not done) or leave a reference when the span has only "them" | label decision for the owner |

Nothing here is a reason to change the labels: only 1 VSS miss and 5 SOP-BERT outcomes follow an open case. The one label decision that moves the
numbers is the last row.
