---
name: llm-annotated-data
description: Have LLM agents write realistic annotated training data (texts first, then labels with spans and triggers), check the labels against conventions and the existing majority, and verify nothing was bent to fit.
---

# Realistic annotated data written by LLM agents

Use when a learned reader needs more examples of real use: whole messages as people write them, each request labelled in a fixed formal legend. Written for diagram-vss-demo (legend: docs/js/logic.js; spec: training/sketch/llm_train/TRAIN_MSG_SPEC.md; conventions: training/sketch/LABEL_CONVENTIONS.md) but the procedure is general.

## Principles (each one learned from a mistake)

- The text comes first; the annotation follows it. Never edit a text so that it passes a validator or is easier to label. Two writers did this silently; it removes exactly the constructions the reader must learn.
- No quotas and no target distributions in the brief ("roughly a quarter long" made a writer pad messages). Ask for natural, varied messages: many domains and personas, typos, chatter, self-corrections, questions, any length from one sentence to 20.
- A request the legend cannot express gets no wire. A taken-back request gets no wire. Never invent keys.
- Conventions win over the spec; where both are silent, the majority labelling of the same construction in the existing data wins (count it; under 2/3 or fewer than 5 cases: list it for the owner, do not decide).
- A writer reads only the spec and the conventions, not other data and not any reader's output.

## Procedure

1. **Brief the writer** (Sonnet or Haiku, effort medium): the two files to read, the output folder and id range, the targeted constructions (from the current failure analysis), "texts first" with the exact paths, the rules above, a self-validation script (JSON per line, span is an exact substring of text, trigger inside span, no two wires with the same span, legend values only, wires in text order, texts byte-identical to the texts file), "do not commit".
2. **Texts first**: `<folder>/texts/texts_NN.jsonl` (id, domain, names, text), then `<folder>/batch_NN.jsonl` or `msg_NN.jsonl` with the wires (span, trigger, type, args).
3. **Verify** (coordinator, by script, not by trusting the report): texts identical between the texts files and the annotated files; if the writer had no texts files, compare with its first Write calls in its transcript. Count messages, wires, sentence-length distribution.
4. **Label check** (a different Sonnet agent, effort medium): every wire against the conventions and the existing majority; log every change (id, before, after, reason with the count) in `<folder>/LABEL_FIXES.md`; never change texts; list undecidable cases for the owner. The checker searches only the data folders (no repository-wide recursive search).
5. **Commit** (coordinator) with the counts, the label-fix summary, and anything the writer disclosed. Add new conventions to LABEL_CONVENTIONS.md with the counts that justified them.

## Known label traps (diagram-vss-demo)

- Verb ellipsis ("Paint Mon red, Tue gold"): each request its own span, trigger inside its own span.
- A chain that closes a loop: a chain plus a separate closing connect.
- "with a line": the editor reads "line" as no arrowhead; decide one convention and apply it everywhere.
- "next to X" in a question: neighbors vs a spatial list; "the copies": `$new`, not a quantifier mention.
- Cumulative cuts: a writer may label one request as several nested wires ("make Rabbit big", "make Rabbit big and red", ...). Check by script that no two spans of a message overlap (search them in text order); merge each group into one wire per request (longest span, merged args), as the majority does (multi-attribute `set` as one wire: 841 vs 13). Seen in 299 of 500 messages of one Haiku set.

## Checks to run by script after every writer and every label check

- JSON per line; the same ids, texts, names and domains as the backup / texts file (field by field).
- Every span an exact substring of the text, every trigger inside its span, wires in text order, no duplicate and no overlapping spans.
- Counts before / after (messages, wires) match the report.
