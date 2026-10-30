# training/sketch: the sketch world (the SOP Sketchpad legend as a VSS world)

| file | content |
|---|---|
| `generate.py` | the legend (events = the demo's actions, questions, facts and default rules; roles = its legend questions), the kinds lexicon, the sentence templates, and the world folder `worlds/sketch/` that `sop check` validates and `sop train` trains; also `eval/*.jsonl` (sentence, names, gold frame) |
| `normalize.json`, `normalize.py` | the normalizer, the same table as `docs/js/snorm.js`; `parity.mjs` checks the two give identical tokens |
| `make_bench.mjs` | the benchmark sets in `docs/bench/`: gold wires built with the adapter the VSS reader uses (`docs/js/vss-adapter.js`) |
| `hand_labelled.json` | 40 hand-labelled sentences (the rules were tuned with these in view) |
| `hand_blind.json` | 60 paraphrases written before any reader ran on them; no reader is tuned on them afterwards |
| `score_rules.mjs` | the rules formalizer on the benchmark sets, in node |
| `build.sh` | the pipeline: generate, check, train, export to `docs/model/sketch`, benchmark sets, parity |
| `score_all.mjs` | Rules and VSS on every benchmark set in node, with the browser pipeline; `RESULTS.md` has the numbers |
| `hand_broad.json` | 128 varied English messages (commands, questions, typos, casual, multi-clause), written blind |
| `patches/` | the calibration patch applied to the local vss-demo checkout before training (RESULTS.md, finding 2) |
| `runs/` | the training runs (command, splits, log, metrics, REPORT.md) |

## Design

- **One clause per sentence.** The demo's rules segmenter cuts a message into clauses ("draw a circle and connect it to Start") before any
  reader; the VSS reader reads one clause.
- **Acts as events.** Commands, questions, facts and default rules are all events of one legend, decided by the predicate role. Question
  openers become pseudo-verbs in the normalizer (how many → `how_many`, is there → `is_there`, where is → `where_is`, is there a path from →
  `path_q`, ...), so a question is read exactly as a command is.
- **Names and labels are never in the lexicon.** A word the lexicon does not know becomes a NAME token `n_<word>`, a quoted label a TEXT
  token `t_<words>`; the legend's value patterns give them their kinds and the reader's sentence candidates read them without retraining.
  A capital "A" is the shape named A unless an article fits ("draw A big star" is an article, "connect A to B" a name).
- **Descriptions are entities** (head = shape word, attr = colour, det = the / all / every / newest / oldest); the adapter turns them into
  the demo's mention wires, which the engine resolves against the drawing.

## Numbers

Every number about the model points to its run folder under `runs/` (command.txt, train.log, metrics.json, REPORT.md). The generated test
sets share the templates of training (new names, held-out template × prefix combinations), so they measure the reader on the world it was
built for; the blind paraphrases measure it outside.
