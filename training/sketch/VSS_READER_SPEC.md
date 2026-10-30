# VSS reader of the sketch world: specification

Status: target design, decided 2026-10-30. Parts not yet implemented are marked (todo).

## 1. Inputs

| input | written by | file |
|---|---|---|
| legend: actions, question types and their questions (keys) and values | people (may be drafted by an LLM) | `docs/js/logic.js` (legend), exported to the world's `legend.json` |
| training messages with gold wires, each wire with `span` and `trigger` | LLM agents or people, from `llm_train/TRAIN_MSG_SPEC.md` | `llm_train/<model>_msg/msg_*.jsonl` |
| cue list (words the rules know for each legend value) | shared, from the legend | `legend_cues.json` (export_cues.mjs) |

Nothing else is hand-written: no kind list, no per-word lexicon, no sentence templates in the base model.

## 2. Building the world from the inputs (todo: replaces the hand-written kinds of generate.py)

1. Each wire's `span` is one training row: its text (normalized: quoted labels -> text tokens, names -> name tokens), its event (the
   action or question type) and its roles (the legend keys with their values located in the span).
2. Kinds, learned from the annotation:
   - the words of `trigger` -> the verb kind of the event (`V:create`, `V:connect`, `Q:count`, ...); a trigger word seen for several
     events gets the kind of its majority event, and the conflict is listed in the build report;
   - a word annotated as the value of a legend question -> the kind of that question (`colour`, `shape`, `size`, `position`, ...);
     names -> `name`; numbers -> `number`; quoted labels -> `text`;
   - the most frequent function words of the training text (the, to, of, and, with, ...) -> a kind of their own each (they route roles);
     the cut-off is a parameter of the build, reported;
   - every other word -> `other`.
3. The world's `kinds.tsv` and lexicon are written from step 2; the build report lists the kinds, their sizes and the conflicts.

## 3. Reading

- A word not in the lexicon gets kind `unknown` (no guessing from spelling or context).
- If no verb kind is found in a sentence, or the reader's status is `unknown-event` / `no-sense` / `abstain`, the reader returns an
  abstention for that sentence with the words it did not understand; the editor asks the person to rephrase in diagram terms and
  still executes the other sentences of the message.

## 4. Adding words and constructions later

- A synonym of a known action or value: one lexicon line (word -> existing kind). No retraining, nothing to forget.
- A new construction (a sentence shape the route book has not seen): further training from the current model on the new examples
  mixed with a sample of the old ones; then re-run all test sets and report any loss.

## 5. Evaluation

- Test sets: `llm_bench/sonnet`, `llm_bench/haiku` (500 messages each), `docs/bench/blind.json`, `training/sketch/hand_broad.json`.
  Never used for training, cues, lexicon or thresholds.
- Per reader (rules, VSS): per wire correct / abstained / wrong; per message fully right; the same split for requests whose trigger was
  seen in training vs not seen.
- Every reported number names the model run, the training data and the test set.
