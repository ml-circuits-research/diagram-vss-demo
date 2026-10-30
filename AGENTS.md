# AGENTS.md: rules for anyone (person or agent) working in this repository

Read this first. These rules come from mistakes already made here; each says what to do and why.

## Language and repository policy

- Everything written to disk, commits and code comments are in English. Talk to the owner in the language they write in (Romanian).
- This repository: commit and push directly to `main`, no pull requests.
- Other repositories (ml-circuits-research/vss-demo, vsa-semantic-space, ...) are research repositories: never push or open PRs there
  without asking. Copy what is useful into this repository and change the copy. Problems found there go in `ISSUES_OTHER_REPOS.md`.
- Do not commit files that a running process is still writing (training runs, agents writing data). Commit them when they are final.

## Scope: what the editor is

- The editor understands requests stated in diagram terms: shapes, names, colours, sizes, positions, arrows and lines, layout, and
  questions about them (the legend, `docs/js/logic.js`). Words with an obvious diagram meaning (feeds, flows into, goes to, sends to,
  points to) are in scope and belong in the training data.
- It is NOT a translator from other worlds (food chains, org politics, philosophy). A message it cannot map to the legend gets an
  honest answer: it says what it did not understand, does everything else in the message that it did understand, and tells the person
  which words it does understand ("say it with shapes and arrows, e.g. connect Plankton to Krill"). Never guess silently.
- Not the goal: perfection or open-ended intelligence. The goal: useful, fair, honest about what it does not understand.

## Data: realistic, never invented by us

- Training data and test data are realistic messages written by LLM agents (or people), in the style of real use: whole messages of
  4-5 sentences with chatter, self-corrections, typos, many domains and personas. Specs: `training/sketch/llm_bench/SPEC.md` (test),
  `training/sketch/llm_train/TRAIN_MSG_SPEC.md` (training).
- The training data must be the same KIND of text as the test data (whole messages, not isolated one-line clauses). A mismatch there
  was measured once: 10.6% of the test words never occurred in clause-only training data, mostly connectives (also, because, since).
- Never drop realistic training examples because the current pipeline cannot read them. If the pipeline cannot read them, that is a
  finding to report, not a filter to apply.
- Template-generated sentences (`training/sketch/generate.py`) are at most a secondary, clearly labelled variant, never the base.
- The test sets (`llm_bench/sonnet`, `llm_bench/haiku`, `docs/bench/blind.json`, `hand_broad`) are never read while writing training
  data, rules, cues or lexicon entries. Nothing is tuned on them.

## The VSS reader: what is given and what is learned

See `training/sketch/VSS_READER_SPEC.md`. In short:
- The legend (questions and their values) is the only hand-written input of the world.
- The word kinds (word categories the VSS reader takes as input) are LEARNED from the annotated training data, not written by hand:
  the trigger word of a request -> the verb kind of its action; an annotated value -> the kind of its legend question; the other words
  -> one kind "other". The number of kinds follows from the legend and the data. Hand-written kind lists are not allowed.
- A word never seen in training has kind "unknown". If no action can be read, the reader abstains (it asks); it does not guess.
- Adding a synonym of a known action ("feeds" = connect) is a lexicon entry: no retraining. A new sentence construction needs further
  training from the current model, mixed with old examples, and the old tests are re-run to show nothing was lost.

## No hand-written equivalences between language and the legend

- The only hand-written inputs of a learned reader are the legend (questions and their values), the annotated data and the model's
  architecture. Every mapping from words to the legend (verbs, values, question forms, how a message is cut into requests) is learned
  from the annotated training data. A table that says "under means below" or "how many means count" is a hack, even when it helps.
- Mechanical steps that stay (tokenization, names by capital letter, digits, contractions) are listed explicitly in
  `training/sketch/VSS_READER_SPEC.md` and measured: what is lost if a step is removed.
- Debt to pay (2026-10-30), in this order: value equivalences (legend cue words) -> learned from the annotation; cutting a message into
  requests (today the rules' segmenter) -> learned from the spans; the trigger context classes and the thresholds -> chosen on held-out
  training messages, not by hand.

## Fair comparison

- Rules and VSS use the same legend and the same cue list (`export_cues.mjs` -> `make_normalizer.py`). A cue added for one reader is
  added for both, and only from training data.
- Scores are reported in three columns per reader: correct, abstained ("did not understand", honest) and wrong (did something else).
  A wrong executed command is worse than an abstention.
- Also report separately the requests whose trigger word was seen in training and those whose trigger was not.
- One change at a time, and every number states which model, which data and which test set produced it.

## Working with the owner

- Architecture changes need the owner's approval BEFORE they are built: a new learned component (a tagger, a classifier, any model
  besides the VSS reader), a new layer in the pipeline, or replacing one. Propose it with the reason and the alternative, then wait.
  (2026-10-30: a perceptron segmenter was added without asking; it stays only as a labelled baseline until the owner decides.)

- Do not take decisions that move away from real use without asking; state assumptions explicitly, with concrete examples.
- Explain in plain words, without jargon; no needless cleverness. If something was a mistake, say so plainly and fix it.
- Long runs (training, agents) are reported when they finish, with numbers; never predicted.
