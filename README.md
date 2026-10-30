# diagram-vss-demo

**SOP Sketchpad**: a diagram editor you talk to in English, in the browser, with no server. Every message is formalized into SOP Lang
wires by one of three readers, and the same engine and the same Datalog reasoner run the wires, whichever reader wrote them:

| reader | what it is | model |
|---|---|---|
| **Rules** | hand-written extractors keyed on the legend's cue words, with spelling correction and mention resolution | none (code) |
| **VSS** | a VSS reader (VSA route book, no transformer) trained on this demo's legend with the `sop` tool of [vss-demo](https://github.com/ml-circuits-research/vss-demo) | `docs/model/sketch/` |
| **Neural** | pretrained transformers through Transformers.js: zero-shot NLI for the act, extractive QA (DistilBERT SQuAD) for each legend question | downloaded from the Hugging Face hub on first use |

The **Benchmark** tab (menu ⋮) runs the readers on the same labelled sentences in the browser and shows accuracy per test set, the model
size, the load time and the time per message.

Open it: `docs/` is the whole application (GitHub Pages from `/docs`, or `npx serve docs` locally; ES modules do not load from `file://`).

Working rules for this repository (scope, data, fairness): `AGENTS.md`. The VSS reader's design: `training/sketch/VSS_READER_SPEC.md`.

## Layout

| path | content |
|---|---|
| `docs/index.html`, `docs/js/` | the application: `logic.js` (SOP Lang, legend, engine, plugins, rules formalizer, Datalog reasoner), `ui.js`, `scenarios.js`, `neural.js` (Transformers.js formalizer), `vss-formalizer.js` + `vss-adapter.js` + `snorm.js` (the VSS reader's pipeline), `vss.js` + `vss/` (the browser VSS reader, copied from vss-demo `app/src`), `bench-canon.js` (benchmark scoring) |
| `docs/model/sketch/` | the exported VSS model (`model.json`, `routebook.bin`, `stars.bin`, `manifest.json`) and its normalizer table |
| `docs/bench/` | the benchmark sets (labelled sentences with their gold wires) |
| `training/sketch/` | the sketch world: legend and sentence generator, normalizer (Python, with a parity test against the browser one), benchmark builder, run logs; `build.sh` runs the whole pipeline |

## The legend

One legend drives every reader. Its questions (Legend tab) are answered per message: action or question type, shape, colour, size,
name, label, position and anchor, direction and distance, from / to, line style and arrow, axis, layout, count, and five questions taken from
the vss-demo diagram world: **pairing** ("connect the circles in a chain"), **negated colour** ("the circles that are not red"),
**even spacing** ("distribute the shapes evenly"), **z-order** ("bring Start to the front") and **recency** ("the new diamond").
A new legend question needs: a legend entry in a plugin (`logic.js`), its cue words for the rules, a frame entry for the neural reader
(`neural.js`), and a role in the sketch world (`training/sketch/generate.py`) followed by a retraining.

## Licences

This repository: AGPL-3.0 (LICENSE). `docs/js/vss.js` and `docs/js/vss/` are copied from ml-circuits-research/vss-demo `app/src`
(MIT, commit 9c85649). The training tool is copied into `training/vss` (MIT, see its PROVENANCE.md).
