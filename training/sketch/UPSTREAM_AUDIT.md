# Upstream audit: how far our VSS core is from vss-demo and from the paper, and whether we lowered its correctness (2026-11-02)

The owner's question: how much is our implementation modified compared to vsa-semantic-space on the formalisation core, and compared to
vss-demo: did we make changes that broke its architecture or its level of correctness?

Lineage:
- **vsa-semantic-space @ e531283**: the paper "VSS: Formalising Natural Language in a VSA Semantic Space". Frozen.
- **vss-demo @ 9c85649**: imported e531283, then changed `tool/sop` (its one commit says "tool/sop synced from vss-vs-bert be51865").
- **ours**: `training/vss/` (copied from vss-demo 9c85649 on 2026-10-30, `training/vss/PROVENANCE.md`) and the browser reader
  `docs/js/vss.js` + `docs/js/vss/` (copied from vss-demo `app/src`, same commit).

What "the core" means here: the trainer and reader of `training/vss` (`tool/sop/*.py`, `experiment/*.py`) and the browser reader. The
cutter, composer, context filler, adapter and front end are ours and have no upstream equivalent (section 4).

## 1. Short answer

**Architecture: not broken.** Every shipped model is the vss-demo reader model, unchanged: the codes `path`, `chainL` and `bigram`, the
same phase tables and the same decoder. On 20,125 distinct request spans of the 7 worlds, the vss-demo readers (Python and browser)
make the same decision as ours on every span without a list role (`members`, `targets`). The only other differences are spans that
both readers leave unread (36 in Python, 29 in the browser), where the list of words not understood differs (section 3.1). Our
trainer with every switch at the upstream default reproduces the shipped route books exactly (section 3.2).

**Correctness: not lowered by any change we measured.** Each change that alters an output was measured. Each one raised the precision
of execution (the share of executed actions that are right) and the share of requests done right. Only one raised the share done
wrong: the event hint (+3.6 right, +0.5 wrong, inside its pre-registered limit; precision 76.9% -> 77.7%). The largest effect is a
bug fix: the set-role presence threshold (f830eb7). On links7's held-out requests it lowers done wrong from 75.3% to 54.4%
(precision 22.4% -> 43.3%) and raises right from 21.8% to 41.5%.

**Not measured.** The training A/B against the vss-demo trainer itself. That trainer was killed for memory three times in this sandbox
(details in 3.2). The job script for a bigger machine is ready.

| component | did we break the architecture? | did we lower correctness? |
|---|---|---|
| trainer (`train.py`, `trainer.py`, `v8_gates.py`) | no: same model, same algebra; the memory rewrite reproduces the shipped route books exactly | no: calibration fixes raise right (RESULTS.md, S6, graphq7 here); upstream trainer not re-run (memory) |
| Python reader (`infer.py`) | no: the same decision on every span without a list role | no: only set roles changed, and that change raises right (links7 +19.7 points) |
| browser reader (`reader.js`, `routebook.js`, `loader.js`, `vss.js`) | no: the same decision on every span without a list role | no: set roles new here (upstream refuses them); sparse format 0-6 changed decisions per world; event hint pre-registered |
| export (`export_web.py`) | no: the dense export is upstream's format; the sparse one is an added format | no: sparse = dense on the measured score (MODEL_SIZE.md) |

## 2. Inventory of the changes

### 2.1 Size

Changed lines, `diff` against vss-demo 9c85649 (lines removed + added / lines of the upstream file):

| file | ours vs vss-demo 9c85649 | vss-demo 9c85649 vs paper e531283 |
|---|---|---|
| `tool/sop/train.py` | 436 / 901 | 80 / 857 |
| `tool/sop/infer.py` | 206 / 784 | 274 / 550 |
| `tool/sop/export_web.py` | 168 / 141 | new in vss-demo |
| `tool/sop/cli.py` | 2 / 195 | 27 / 170 |
| `tool/sop/world.py`, `legend.py` | 0 | 35 / 258, 21 / 110 |
| `tool/sop/activate.py`, `typer.py` | 0 | new in vss-demo |
| `experiment/trainer.py` | 28 / 50 | 0 |
| `experiment/v8_gates.py` | 17 / 244 | 47 / 197 |
| `experiment/{camp,guard,v2,v4,v4_torch,v5_scale,v6_left,v7_nested}.py` | 0 | 0 |
| `tool/sop/{check,diff,soplang,__init__,__main__}.py`, `tool/bin/sop` | 0 | 0 |
| browser `vss/reader.js` | 137 / 623 | not in the paper repo |
| browser `vss/routebook.js`, `loader.js`, `vss.js` | 81 / 113, 10 / 50, 19 / 66 | not in the paper repo |
| browser `vss/soplang.js`, `stars.js` | 0 | not in the paper repo |
| new files here | `decode_stats.py` (73 lines), `learn_kinds.py` (272), `experiment/centres.py` (146) | - |

The first copies (6bae2c4 for `training/vss`, dcd89d8 for the browser reader) are byte-identical to vss-demo 9c85649. The one
exception is `train.py`, which carried the calibration patch from the start.

### 2.2 vss-demo's own changes to the paper code (summary)

vss-demo/PROVENANCE.md lists portable stars (`--star_version 2`), sentence candidates, `sop export-web` and the discourse operators.
The diff shows more than that list. The vss-demo `tool/sop` also carries the vss-vs-bert decoder work:
- the contract decoder (`activate.py` DECODERS): sentence candidates (R46), one-to-one role assignment (Q31), the explained residual
  (R41), presence queries, the undecided-adjacency rule (Q38), the second reading without the placed words (Q17 / D28), offers (D27);
- content kinds (D14), the structure anchor (R79), negative examples (R81), the refusal pass (R90-R94);
- in `experiment/v8_gates.py`, a verb-order route (`vorder`, R47/R58), used only when the code `vorder` is declared.

The paper's model files (`v2`, `v4`, `v4_torch`, `v5_scale`, `v6_left`, `v7_nested`, `camp`, `guard`, `trainer`) are unchanged in
vss-demo. Our shipped models use the vss-demo decoder settings `candidates: sentence`, `undecided_adjacent`, `residual: explained`
and `presence_query`. Those are vss-demo's, not ours.

### 2.3 Our changes, one line each

Classes: **A** behind a switch, upstream behaviour by default and in the shipped models. **B** behind a switch, ON in the shipped
models (`train_micro.sh`, the 7 `BUILD.json`, `registry.json`). **C** always on. **D** performance or refactor only, same outputs.
**E** new capability with no upstream equivalent, not used by the shipped models unless stated.

| change | commit: reason / measured result | class |
|---|---|---|
| `train.py` calibration reads attribute / determiner ratios with presence "all" | 6bae2c4 (patch from dcd89d8): rare roles never got an attribute / determiner threshold (ISSUES_OTHER_REPOS 1); sketch world FULL on held-out formulations 0.773 -> 0.894 (RESULTS.md) | C |
| `train.py` set roles of entities take head kinds from their members | 4bc1740: without it, reading a list role fails; reproduced here: vss-demo's `build_schema` gives `members` no `head_kinds`, and the read raises `KeyError: 'head_kinds'` on manage7 | C |
| `infer.py` + `reader.js`: a set role is present only above its own presence threshold | f830eb7: "connect Bias to Hidden" also filled the list role; 53.7 -> 55.4% on perfectly cut held-out requests at the time; re-measured here: links7 21.8 -> 41.5% right (3.3) | C |
| `infer.py` set role read over the sentence's words, as the browser | bf5229e: Python / JS parity (Python only; used by the trainer's own evaluation) | C |
| `reader.js` set roles ported to the browser (`readSetRole`, `$a & $b` wires) | 763b980: lists of shapes; vss-demo's browser reader refuses any world with set roles | E (used: every shipped legend declares `members`, `targets`) |
| `train.py` `CAL_FALLBACK=train`: a role with < 5 present / absent calibration rows is fitted on calibration + training rows | a78f3f7: such roles were never given; S6 (CAPACITY.md): 61.0 -> 62.0% SEG=gold, 0 requests right -> wrong, route book byte-identical; graphq7 here: 84.8 -> 85.4% right (3.2) | B |
| `train.py`, `trainer.py`, `v8_gates.py`: training memory bounded by one step (only the reached phase rows held, targets per batch, each batch at its own length) | 98a6b9a: the DATA=all world was killed for memory; route book, losses, thresholds bit-identical with `--pad_to_longest`, the gates' gradient can differ in the last bit without it; peak 3.37 -> 1.22 GB | D |
| `infer.py` K x K x D tables kept as float32, the route book loaded once | 98a6b9a: same float64 values (exact conversion), half the memory | D |
| `train.py` `fit_threshold` in O(n log n) | 8c2ba11: same value, measured | D |
| sparse route book: `export_web --sparse`, `loader.js`, `routebook.js`, `infer.py pair_rows` | fbaa8dc: untrained kind pairs stored as absent (they contribute nothing) instead of their random initial phases; 63.2% = 63.2% SEG=gold, 106.7 -> 12.2 MB (MODEL_SIZE.md); here 0-6 changed decisions per world (3.1) | B (all 7 shipped exports are vss-web-2; vss-demo's loader cannot read them) |
| `reader.js` `opts.event`: the predicate's candidates restricted to a given event's verbs | 0cbdcc5: verbless requests; H1 on the sample 69.6 / 14.3 / 16.1 -> 73.2 / 14.8 / 12.1 (EVENT_HINT.md, pre-registered, met) | B (registry `event_hint: H1`) |
| EXCL: of two roles the training frames never give together, keep the stronger | a76b4e3, `decode_stats.py`: FAIL (+0.5 < +1.5 points, DECODE.md) | A (llm_score refuses it now) |
| centre reader (one state per action token): `experiment/centres.py`, `train_centres`, `centre_addresses`, `readMessage` | 03ff6e5, 28e1385: two pre-registered runs FAILED (47.7% and 50.6% < 58%); one-request path checked unchanged | A / E (only when a legend sets `reader.centres`; none does) |
| `learn_kinds.py` (learned kind map) | 6d74d8d: design parked, never imported or run | E |
| `infer.py` `fmt(x + 0.0)`; `_margin.<set role>` line placed after the set line | 28e1385: -0.0 printed as 0.000 like the browser; line order only | D |
| `reader.js` refactors: `formalizeState`, `residualExplained(addrOf)`, `export fillerWords` | 03ff6e5, 98fb038: needed by the centre reader / composer; the one-request output unchanged (parity checked) | D |
| `trainer.py` peak-RSS in the log, `--stop_after`, `--loss_every_step`, gradients freed after training | 98a6b9a: debugging and equivalence checks | A / D |
| `cli.py` usage line mentions `--sparse` | fbaa8dc | D |

Summary: 4 changes are always on and change outputs, all of them in calibration or set roles (class C). 3 switches are on in the
shipped models (CAL_FALLBACK, sparse export, event hint). 2 failed experiments stay behind switches that are off (EXCL, centre reader).
Everything else is memory, speed or refactoring with outputs checked identical.

## 3. Measurements

Data for 3.1 and 3.3: the per-event gold folders `training/sketch/eval/goldev/<event>`, built from the committed annotated messages.
Each world is read on the spans of its own events, with its own `front.json` (as `llm_score.mjs SEG=gold`). **Held-out** = the
messages that `msg_to_world.py` puts in `calib.sop` (8% of the messages, by a hash of the id). No world trains on them. Half of their
requests set the presence thresholds. Total: 1753 messages, 2099 requests of the 7 worlds' events. Models: the 7 shipped worlds of
`docs/model/micro/registry.json` (`worlds_micro/<w>/model` is the trained source of each and matches its `trained` timestamp). One
seed (0) everywhere.

### 3.1 Reader parity: same model, same input, ours vs vss-demo's

Browser: ours (`docs/js/vss.js`) against vss-demo 9c85649 `app/src/vss.js`, both on a dense 8-bit export of the same model (our
`sop export-web` without `--sparse`). vss-demo's reader refuses every one of our models as shipped, for two reasons: their legends
declare the set roles `members` and `targets` ("not ported"), and the shipped files are sparse (vss-web-2). For this test its
set-role guard was removed (one line, in a scratch copy) and it was given the dense export. Python: vss-demo's `infer.Reader`
against ours on the same `model/` folder. vss-demo's Python reader supports set roles, so this is the fair A/B for them. The script
compares the status and the full SOP text of every distinct normalized span.

| world (spans) | browser: ours vs vss-demo, spans that differ | Python: ours vs vss-demo, spans that differ |
|---|---|---|
| history7 (235) | 0 | 0 |
| graphq7 (2605) | 0 | 0 |
| questions7 (2612) | 8, all with a list role | 252 (248 with a list role, 4 unread spans whose `_unplaced` differs) |
| manage7 (1068) | 6, all with a list role | 6 (5 with a list role, 1 unread span) |
| position7 (4129) | 533 (522 with a list role, 11 unread) | 1921 (1919 with a list role) |
| links7 (3482) | 1792 (1775 with a list role, 17 unread) | 3201 (3200 with a list role) |
| shapes7c (5994) | 115 (114 with a list role, 1 unread) | 4267 (4239 with a list role, 28 unread) |

"With a list role" = `members=` or `targets=` in one of the two outputs. "Unread" = status unknown-event or no-sense in both outputs
(checked for every such span). Only the list of words not understood or the status between those two differs there, and nothing is
executed. Outside list roles the two readers agree byte for byte. The
remaining differences are the set-role changes of 2.3, and 3.3 measures their effect on the score.

Sparse vs dense (our reader, the shipped sparse files vs a dense export of the same model). Spans whose output differs / spans whose
decision differs (the status or a role or value, not counting margins and residuals): history7 3 / 0, graphq7 25 / 2, questions7 16 / 0,
manage7 5 / 1, position7 17 / 4, links7 13 / 6, shapes7c 18 / 3. The decisions that change are ok <-> abstain or one presence query, e.g. graphq7
"is_there red ones": ok in the sparse export, abstain in the dense one. This agrees with MODEL_SIZE.md: equal SEG=gold scores on three
dev files.

### 3.2 Training: the same world trained by vss-demo's tool, by ours at upstream defaults, and by ours as shipped

World: the world folders the shipped models were trained from (`worlds_micro/<w>`, same `examples/*.sop`), the `train_micro.sh`
command (D 1024, seed 0, 10 epochs, `--shuffle`, `--star_version 2`, `--threshold_rule fit`), CPU, one thread.

- **history7** (536 rows, 57 kinds, no roles at all): ours with every switch at its default gives a route book **bit-identical** to the
  shipped one (path, bg0, bg, A, L, logits, gates), the same thresholds and config. Trainer FULL on held-out formulations: 1.000 for both.
  CAL_FALLBACK cannot act in a world without roles.
- **graphq7** (2729 rows, 12 roles, none of them a list role, so vss-demo's trainer can train it): ours with CAL_FALLBACK unset gives
  a route book **bit-identical** to the shipped one. The sparse `routebook.bin`, `stars.bin` and `front.json` are byte-identical too.
  Only two thresholds differ: `presence:landmark2` and `presence:size` are fitted only with CAL_FALLBACK (null without).

| graphq7, SEG=gold (llm_score.mjs) | right / not done / done wrong, extra | precision of execution |
|---|---|---|
| all 2754 requests, CAL_FALLBACK off (upstream default) | 84.8 / 6.6 / 8.6, extra 93 | 87.6% |
| all 2754 requests, CAL_FALLBACK=train (shipped) | 85.4 / 6.6 / 8.1, extra 93 | 88.2% |
| 271 held-out requests, off | 84.1 / 5.9 / 10.0, extra 9 | 86.4% |
| 271 held-out requests, shipped | 84.5 / 5.9 / 9.6, extra 9 | 86.7% |

(Precision of execution = right / (right + done wrong + extra), counts from the percentages.) Trainer FULL on held-out formulations:
0.863 off, 0.885 shipped.

- **vss-demo's trainer (9c85649)**: the run was **killed for memory** three times on history7 (`exit 137`; the kernel log shows the
  memory cgroup killing it at 1.25-1.35 GB, while the other agents' processes held the rest of the sandbox's 5.8 GB). That trainer
  holds the whole phase table 5-6 times (98a6b9a). So **the A/B against the upstream trainer was not measured**. The job script for a
  machine with more memory is `upstream_ab_job.sh`, delivered with this audit in the agent's scratchpad (the coordinator decides
  where it goes and submits it). It
  trains history7 and graphq7 with vss-demo 9c85649, ours at defaults and ours as shipped, and exports each one dense for
  SEG=gold. Which of our always-on changes can act in these two worlds, from the code: none on history7 (no roles); on graphq7 only
  the attribute / determiner calibration patch (it has entity roles; no list role). The memory rewrite is bit-identical with
  `--pad_to_longest`, and can differ in the last bit of the gates' gradient without it (98a6b9a).
- **vss-demo's trainer cannot train the other 5 worlds at all**: their training rows have list roles (`members`, `targets`), and
  `build_schema` of 9c85649 gives such a role no `head_kinds`. Reproduced here on manage7: the read after training raises
  `KeyError: 'head_kinds'`. Our 4bc1740 is the fix.

### 3.3 The always-on set-role change, measured now (f830eb7)

A scratch copy of our browser reader with only the f830eb7 lines removed (a set role is then present whenever one member passes the
member threshold, as in vss-demo's `infer.py`), scored with `llm_score.mjs SEG=gold` on the held-out requests of each world:

| world | right / not done / done wrong, with f830eb7 (shipped) | without f830eb7 (vss-demo's rule) |
|---|---|---|
| links7 (340 requests) | 41.5 / 4.1 / 54.4 (precision 43.3%) | 21.8 / 2.9 / 75.3 (precision 22.4%) |
| the other 6 worlds | the same numbers as without | the same numbers as with |

Without the fix a list role is given whenever one name passes the member threshold, so "connect Bias to Hidden" also fills the
list role with both names (the case in f830eb7). On links7: 67 fewer requests right and 71 more done wrong.

### 3.4 Changes with an existing before / after measurement (cited, not re-run)

| change | where | before -> after |
|---|---|---|
| calibration patch (attribute / determiner) | RESULTS.md | sketch world FULL held-out formulations / held-out sentences / new identities 0.773 / 0.848 / 0.813 -> 0.894 / 0.902 / 0.907 |
| CAL_FALLBACK=train | diagnosis_capacity/CAPACITY.md S6 | SEG=gold old dev 61.0 -> 62.0%; requests that held a rare role 9 -> 20 right; 0 right -> wrong |
| sparse route book | MODEL_SIZE.md | SEG=gold 63.2 = 63.2% (data2), 61.0 = 61.0% (fix); 106.7 -> 12.2 MB |
| event hint H1 | EVENT_HINT.md, COMBINED.md | 1000-message sample 69.6 / 14.3 / 16.1 -> 73.2 / 14.8 / 12.1 (right / wrong / not done), extra 321 -> 300; precision of execution 76.9% -> 77.7% (from its counts) |
| set roles present by their own threshold | f830eb7 message | 53.7 -> 55.4% on perfectly cut held-out requests (old dev, old single model) |
| EXCL (off) | DECODE.md | FAIL: +0.5 points, needed +1.5 |
| centre reader (off) | PLAN_B / 28e1385 | FAIL: 47.7% and 50.6%, needed 58% |
| training memory rewrite | 98a6b9a message | route book, losses, thresholds and metrics bit-identical with `--pad_to_longest` on the old world; peak 3.37 -> 1.22 GB |

## 4. Everything around the reader: who does each job

The reader reads one request in one world. Everything that turns a whole message into executed commands is ours. The table says how
vss-demo's app does each job, and how the paper's pipeline (vsa-semantic-space `sop formalize`) does it.

| job | vss-demo app (and the paper's `sop formalize`) | ours |
|---|---|---|
| tokens, values, triggers | `app/src/normalize.js`: a hand-written table (`normalize.json`, port of `worlds/diagram/normalize.py`). Paper: whitespace + punctuation tokens; kinds from the world's given lexicon | `docs/js/front.js`: value n-grams and trigger rules LEARNED from the annotation (`front.py`), one `front.json` per world |
| spelling | `app/src/correct.js`: Damerau-Levenshtein against the world's lexicon and the diagram's labels, variants read by the reader | `docs/js/spell.js` (VSA spell checker) before all readers |
| cutting a message into requests | `app/src/segment/segment.js`: hand-written cut signals (punctuation, connectives, commas), then merge / split by reading quality (hill climbing on poor units). Paper: one line = one sentence (or a regex sentence split with `--paragraphs`) | the cutter: an averaged-perceptron B/I/O tagger LEARNED from the annotated spans (`train_cutter.py`), with B-<world> labels |
| choosing the world | `app/src/routes.js`: every route reads every variant, the clearest reading wins (status, then margin, residual). Paper: the dispatcher by fit (smallest relative residual) | `docs/js/vss-composer.js`: the cutter's top-3 worlds read the unit, the reading with the fewest words not understood wins; the event cutter's hint re-reads verbless units (H1) |
| links between requests (references, order, conflicts) | `app/src/segment/circuit.js`: shared entities by hand-written rules (recent, label, description, ordinal...), discourse operators, execution order, conflicts. Paper: none (sentences are independent) | `docs/js/vss-context.js`: the context filler (closed candidate sets, a small learned linear ranker, a margin) fills pronouns / "the new one" from the message |
| from a reading to commands | the app's editor executes the SOP wires (`app/src/editor/`) | `docs/js/vss-adapter.js`: SOP wires -> the editor's commands (offers accepted, list order from the text) |
| what the reader could not read | `app/src/gaps.js`: a local journal of readings with unplaced words, low margins, abstains | the composer's "ignored" zones and asked requests |

So the vss-demo app solves the same jobs with hand-written rules (normalizer table, connective segmenter, linking rules). We replaced
them with learned pieces, as AGENTS.md requires. None of this changes the reader, but all of it affects our 77.2% (section 5).

## 5. Is the paper's accuracy comparable with our 77.2%?

No. Different task, different data, different count.

| measure | what is counted | number |
|---|---|---|
| paper, synthetic worlds (STATUS.md claims table) | one constructed sentence, gold kinds, every role exact (FULL) | 1.000 on seen formulations (5 seeds); 0.968 at the unseen depth 3 (reference world) |
| paper, WikiSQL (STATUS.md) | one question, real text | selected column 0.82; full query 0.37 (tool FULL 0.217) |
| vss-demo, diagram world (STATUS.md probe D) | one generated sentence, trainer FULL, held-out formulations, mean of 3 seeds | 0.896 |
| ours, the same trainer measure, 7 shipped worlds | one annotated request span of a realistic message, trainer FULL, held-out formulations (1045 rows) | 0.727 pooled (history7 1.000, questions7 0.933, graphq7 0.885, manage7 0.809, position7 0.773, shapes7c 0.573, links7 0.520) |
| ours, one reader on a perfectly cut request in the right world (SEG=gold), held-out | per request, through the adapter, against the editor's gold | 68.8 right / 7.7 not done / 23.5 done wrong, extra 40; precision of execution 73.0% (2099 requests) |
| ours, the whole formalizer (registry, 1000-message sample) | per request in whole messages: cutter + routing + reader + context filler + adapter | 77.2 / 11.4 / 11.4 (now 77.1 / 11.0 wrong, 10c5526) |

Per world, SEG=gold on held-out (right / not done / done wrong, precision of execution): history7 95.7 / 4.3 / 0.0 (100%), questions7
83.9 / 7.9 / 8.2 (86.6%), graphq7 84.5 / 5.9 / 9.6 (86.7%), manage7 83.3 / 1.0 / 15.6 (84.2%), position7 69.6 / 3.0 / 27.4
(70.6%), shapes7c 62.8 / 15.9 / 21.3 (73.6%), links7 41.5 / 4.1 / 54.4 (43.3%).

The number that answers "what does one reader do on a perfectly cut request" is the SEG=gold row: **68.8% right on held-out requests**
(the f830eb7 number, 55.4%, was the same kind of measure with one big model on the old dev file). It is lower than the 77.2% of the
whole formalizer. The two measures differ in two ways, not measured apart: the 1000-message sample is training data for the worlds
while the held-out requests are not, and the composer adds the context filler and the choice between worlds. The paper's
1.000 / 0.968 and vss-demo's 0.896 are FULL frames on sentences generated from the world's own templates. On realistic requests the
same trainer measure gives 0.727 for our worlds. What differs from the paper is the data and the task, not the reader: on the same
model our reader makes the same decisions as vss-demo's, except for list roles, where ours is measured better (3.1, 3.3).

## 6. Reproduction and what is left

Scripts (agent scratchpad `audit/`, not committed): `parity.mjs` (browser parity, writes the normalized spans), `pyread.py` /
`pyparity.sh` (Python parity), `cmpmodel.py` (route books and thresholds), `gold.sh` (SEG=gold per world), `train.sh` (one training),
`upstream_ab_job.sh` (the training A/B on a bigger machine), `tree_nof830/` (the reader without f830eb7).

Left open: (1) the training A/B with vss-demo's trainer (memory; job script ready); (2) only one seed everywhere; (3) SEG=gold on
all requests (training data included) was run for graphq7 only (85.4%, against 84.5% held-out), not for the other worlds.
