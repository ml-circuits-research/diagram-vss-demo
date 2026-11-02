# training/sketch: the VSS worlds of the SOP Sketchpad legend (training, data, scoring)

The demo's VSS reader is the composer (`docs/js/vss-composer.js`): a cutter cuts a message into units, the cutter proposes up to three
of the 7 micro-worlds (shapes, links, position, graphq, questions, manage, history; `docs/model/micro/registry.json`) for each unit, the
reading that leaves the fewest words not understood wins, and the context filler (`docs/js/vss-context.js`) fills references. There is no
fallback model and no single model. `train_micro.sh` builds one world, `train_cutter.py` the cutter, `llm_score.mjs` scores the composer
(`SEG=composer`) or one world (`MODEL=micro/<world> SEG=gold`). The topic documents in this folder (SHORT.md, ROUND2.md, ...) are dated
experiment records; some name model folders that were removed later and say which commit holds them.

| file | content |
|---|---|
| `generate.py` | the legend (events = the demo's actions, questions, facts and default rules; roles = its legend questions), the kinds lexicon and the sentence templates (template sentences are a secondary, labelled variant, AGENTS.md); also `eval/*.jsonl` (sentence, names, gold frame) |
| `normalize.json`, `normalize.py` | the normalizer, the same table as `docs/js/snorm.js`; `parity.mjs` checks the two give identical tokens |
| `make_bench.mjs` | the benchmark sets in `docs/bench/`: gold wires built with the adapter the VSS reader uses (`docs/js/vss-adapter.js`) |
| `hand_labelled.json` | 40 hand-labelled sentences (the rules were tuned with these in view) |
| `hand_blind.json` | 60 paraphrases written before any reader ran on them; no reader is tuned on them afterwards |
| `score_rules.mjs` | the rules formalizer on the benchmark sets, in node |
| `llm_score.mjs`, `short_bench/` | the composer (and the rules) on the LLM-written messages and on the demo's benchmark sets, in node, per requested action |
| `hand_broad.json` | 128 varied English messages (commands, questions, typos, casual, multi-clause), written blind |
| `patches/` | the calibration patch applied to the local vss-demo checkout before training (RESULTS.md, finding 2) |
| `runs/` | the training runs (command, splits, log, metrics, REPORT.md) |

## Design

- **One unit per reading.** The cutter cuts a message into units ("draw a circle and connect it to Start" is two); a world reads one unit.
- **Acts as events.** Commands, questions, facts and default rules are all events of one legend, decided by the predicate role. Question
  openers become pseudo-verbs in the normalizer (how many → `how_many`, is there → `is_there`, where is → `where_is`, is there a path from →
  `path_q`, ...), so a question is read exactly as a command is.
- **Names and labels are never in the lexicon.** A word the lexicon does not know becomes a NAME token `n_<word>`, a quoted label a TEXT
  token `t_<words>`; the legend's value patterns give them their kinds and the reader's sentence candidates read them without retraining.
  A capital "A" is the shape named A unless an article fits ("draw A big star" is an article, "connect A to B" a name).
- **Descriptions are entities** (head = shape word, attr = colour, det = the / all / every / newest / oldest); the adapter turns them into
  the demo's mention wires, which the engine resolves against the drawing.

## Numbers

Numbers in the topic documents point to the run or the command that produced them; `RESULTS.md` is the record of the first, single-model
runs (that model was removed). The generated test
sets share the templates of training (new names, held-out template × prefix combinations), so they measure the reader on the world it was
built for; the blind paraphrases measure it outside.
