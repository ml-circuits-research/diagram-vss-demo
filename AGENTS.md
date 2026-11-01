# AGENTS.md: rules for anyone (person or agent) working in this repository

Read this first. These rules come from mistakes already made here; each says what to do and why.

## Language and repository policy

- Everything written to disk, commits and code comments are in English. Talk to the owner in the language they write in (Romanian).
- This repository: commit and push directly to `main`, no pull requests.
- Other repositories (ml-circuits-research/vss-demo, vsa-semantic-space, ...) are research repositories: never push or open PRs there
  without asking. Copy what is useful into this repository and change the copy. Problems found there go in `ISSUES_OTHER_REPOS.md`.
- Do not commit files that a running process is still writing (training runs, agents writing data). Commit them when they are final.
- Agents do not commit or push. An agent leaves its changes in the working tree and reports the files it changed; the coordinator
  reviews them and commits (owner's rule, 2026-10-31: commits made by agents skip the review).

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
  any natural length (one sentence up to 10-20; owner, 2026-10-31: long messages are needed and the centre reader must handle them),
  with text that is not a request, self-corrections, typos, many domains and personas. No quotas, no padding. Specs: `training/sketch/llm_bench/SPEC.md` (test),
  `training/sketch/llm_train/TRAIN_MSG_SPEC.md` (training).
- The training data must be the same KIND of text as the test data (whole messages, not isolated one-line clauses). A mismatch there
  was measured once: 10.6% of the test words never occurred in clause-only training data, mostly connectives (also, because, since).
- Never drop realistic training examples because the current pipeline cannot read them. If the pipeline cannot read them, that is a
  finding to report, not a filter to apply.
- Template-generated sentences (`training/sketch/generate.py`) are at most a secondary, clearly labelled variant, never the base.
- A data writer saves its texts BEFORE annotating (one file per batch, ids and texts only); the coordinator checks that the annotated
  texts are identical to the saved ones. (2026-10-31: two writers edited about 50 texts to fit their annotation; one did not report it.)
- Owner's decision, 2026-11-01 (replaces every earlier rule about hidden test sets): there is no hidden test set. Every annotated
  message (training data, the former test sets, fresh sets, production feedback) is data and may be read, analysed and trained on.
  The owner is the judge. Worlds are measured on the data they are trained on and on similar data: the goal is that they read it
  well. VSS worlds learn transformations in a vector space, not facts; the system's job is to discover new worlds fast and to
  improve them from production feedback.

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

## What counts as an error (owner, 2026-10-31)

- The reader's job is a truthful formalization, not a perfect one. A reference it cannot resolve from the request itself
  (a pronoun, "the new one", a name stated in an earlier sentence) is left as a reference for the reasoning layer, which fills it
  from the context; that is not a reader error. A piece the reader did not understand is reported as not understood (it asks).
- The real error is a formalization that is wrong: a command executed with the wrong action, the wrong shape or the wrong value.
  Decisions weigh "done wrong" first, then "correct"; "not done / asked" is the honest outcome. Do not chase perfection on
  pieces the reasoning layer or a question to the user can supply.
- The measure (owner, 2026-11-01): per requested action only: of the actions that had to be done, how many are done right, how
  many are done wrong, how many are not done; and how many actions nobody requested are done (extra). Per-message scores ("fully
  right messages") are not reported: a long message with 12 requests is almost never fully right, and that says nothing.
- The cutter is measured by the errors it causes (requested actions done wrong or not done, and extras, that come from a bad cut),
  not by span-match scores.

## Fair comparison

- Rules and VSS use the same legend and the same cue list (`export_cues.mjs` -> `make_normalizer.py`). A cue added for one reader is
  added for both, and only from training data.
- Scores are reported in three columns per reader: correct, abstained ("did not understand", honest) and wrong (did something else).
  A wrong executed command is worse than an abstention.
- Also report separately the requests whose trigger word was seen in training and those whose trigger was not.
- One change at a time, and every number states which model, which data and which test set produced it.

## Agents: model and effort per task

- Opus, effort high: changes to the VSS model, trainer or reader (architecture work), independent reviews of such work.
- Sonnet, effort medium: pipeline wiring, running trainings and evaluations, error analyses, label reviews, writing data.
- Haiku, effort medium: simple data writing and mechanical checks.
- The coordinator states the model and effort when launching an agent, reviews every result before it is reported, and makes the commits.

## Experiments

1. Before an experiment, write and show the owner: the hypothesis, how it is measured, and the threshold that means "it worked".
2. No knobs turned on the fly. A parameter comes from the model, or is chosen once, by the protocol fixed beforehand, on held-out
   training messages.
3. If the result misses the threshold: stop and report it. No patches, no "one more try". A negative result is a result.
4. One change, one measurement, one report in plain words.
(2026-10-30: the VSS-native cut scored exact-span F1 0.24 vs 0.92 for the tagger; a weight was then tuned on the fly to 0.38. Wrong.)

## Root-cause analysis after every evaluation

- Every evaluation of a reader is followed by a root-cause analysis of its misses (training/sketch/error_analysis.mjs for VSS: each
  miss classified by the first cause that explains it, with counts and examples, and WHERE the cause sits: data, front end, our
  code, calibration, model). Decisions follow the causes, not the totals.
- Fixes are made where the cause is, in a way that stays right in the long term (the same rule for every role, the same code path in
  Python and JS), never a special case that only moves a number.

## Talking to the owner

- Call things by their name: data is data, a model is a model, a threshold is a threshold. Never call training data a "component".
- No vague words ("mechanism", "component", "signal") when a concrete one exists: say what it is and what it does.
- Do not dramatize or inflate: no "architecture change" for what is new training data or a bug fix.
- Short, literal answers; no guessing games; when unsure, say "I don't know" and how to find out.
- Use the exact terms of the code and the data, not metaphors: VSS has no notion of "chatter"; the annotation has text outside every
  span; the tagger labels tokens B / I / O; the VSS reader returns a status: `ok`, `abstain` (a margin under 0.05: uncertain, still
  executed today), `unknown-event` (no action word found), `no-sense` (more than half of the tokens could not be placed). Say which one.

## Working with the owner

- What the owner proposes or asks for IS approved: do it, do not ask again.
- Approval is needed only for changes the owner did not propose: a new learned component (a tagger, a classifier, any model
  besides the VSS reader), a new layer in the pipeline, or replacing one. Propose it with the reason and the alternative, then wait.
  (2026-10-30: a perceptron segmenter was added without asking; the owner decided it is not part of the architecture.)
- A fix whose cause is measured and that uses what the reader already has (an existing option, a calibration rule, a converter
  bug, a front-end learning rule) needs no approval: pre-register it, run it, report it. (2026-10-31: the owner had to say this
  about the occupancy-marker switch.)

- Do not take decisions that move away from real use without asking; state assumptions explicitly, with concrete examples.
- Explain in plain words, without jargon; no needless cleverness. If something was a mistake, say so plainly and fix it.
- Long runs (training, agents) are reported when they finish, with numbers; never predicted.
