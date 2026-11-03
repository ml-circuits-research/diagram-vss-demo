# Collected requests: the file format (`sop-collect/2`)

The demo keeps every message the user sends in the browser's localStorage (owner, 2026-11-03: "request collection to improve the test
data"), with what VSS-BERT executed or held, and what the user did about it later. Nothing leaves the browser unless the user
downloads the file: ⋮ › Settings › Collected requests › **Download as JSONL** (`sop-requests-YYYY-MM-DD-HHMM.jsonl`).

Code: `docs/js/collect.js` (the store and `buildEntry`), hooks in `docs/js/ui.js`; tests `training/sketch/test_collect.mjs` (node) and
`training/sketch/test_voice_collect_ui.py` (browser). Converter to an un-annotated llm_bench folder: `training/sketch/collect_to_bench.py`.

## Storage

- One localStorage key, `sop.collect.v1`: a JSON array of entries, oldest first. At most the last **5000** entries (older ones are dropped).
- When the browser refuses a write (quota), the oldest tenth of the entries is dropped and the write is tried again until it fits; the
  Settings section says how many were dropped. When the storage cannot be used at all (private window, blocked site data), the entries
  are kept in memory for the page only, and the section says so.
- The switch (on by default) is `sop.collect.off` = `"1"` when the user turned collection off.
- Collected: messages typed in the message box, sent from the dictation dock (spoken or typed in another language), example sentences
  and the reply chips. Not collected: the
  opening message the page sends by itself, SOP Lang typed with `@`, and the toolbar buttons (their Undo is recorded as an event of the
  message before it, see `undo-next`).

## Format 2 (since 2026-11-03): no stored readings

The owner asked why every reader's full reading was stored when it can be recomputed. It can: the readers are deterministic, so the text,
the names on the drawing and the model versions reproduce every reading locally (run the readers of the demo at the commit whose
`docs/model/versions.json` gives the same `models.all`). Format 2 keeps only what cannot be recomputed: the user's input, VSS-BERT's
decision as the user saw it, and the user's later actions, which are the real labels of whether a reading was right. A short message's
entry is about 0.6 to 1.2 KB (measured in the browser test, 2026-11-03). Format 1 entries (below) may still be in a browser's store; the converter reads both.

## One line = one entry

The file is JSON Lines: one entry per line, UTF-8, oldest first. Fields (the ones in **bold** map one to one onto a fresh2 / short3 row,
`training/sketch/llm_bench/fresh2/README.md`):

| field | type | what it is |
|---|---|---|
| `format` | `"sop-collect/2"` | the format of this entry |
| `id` | string | `c-<time base36>-<random>`, unique per entry |
| `time` | ISO 8601 UTC | when the message was sent |
| `session`, `turn` | string, int | the page session (one per page load) and the message's number in it; the events find their entry by these |
| **`domain`** | string | always `"collected from the demo"` |
| **`names`** | [string] | the shapes and groups on the drawing of the VSS-BERT tab before the message (fresh2 `names`) |
| **`text`** | string | the message as sent, in English, before the spell checker (for a message that came through the dictation dock, the English text that was sent) |
| `source` | object | `via`: `typed` (the message box, or typed in the dock), `voice` (spoken in the dock), `example`, `chip` (a reply's button), `script`, `help`, `other`; `lang`: the dock's dictation language (BCP-47); `original`: the words spoken or typed in that language; `translation`: {`by`: `builtin` (the browser's on-device Translator) \| `online` (MyMemory, only when the user opted in) \| `user` (there was no translation; the user wrote the English), `edited`: the English sent differs from the translation}. Untranslated text is never sent to the readers (owner, 2026-11-03): the dock refuses to send it. Format 1 entries may have `by: "none"` (the text was sent as it was) |
| `models` | object or null | the model versions (from `docs/model/versions.json` "files"): `combined` (VSS-BERT's confidence model), `neural` (SOP-BERT), `micro` (a digest of every `micro/` stamp: the nine worlds and the two cutters), `all` (a digest of every stamp). Digests: FNV-1a 32 bits of the sorted `path=version` lines (`collect.js modelVersions`) |
| `tab` | string | the tab shown when the message was sent (`combined` = VSS-BERT) |
| `reply` | string | the text of the line that answered in the chat (at most 280 characters) |
| `decision` | object | VSS-BERT's decision: `status` `read` \| `off` (not loaded: `note` says why) \| `error` (`error` has the message); for `read`, `units`: per request, `index`, `src` (its words), `execute` (true: executed; false: held), `conf` (the confidence) |
| `events` | [event] | what the user did later (below) |
| **`wires`** | `[]` | **the gold: empty, to be annotated** |

Not stored (recomputed from `text`, `names` and `models`): the spell checker's changes, the cut into requests, and every reader's SOP Lang,
wires and gate.

### Events

Every event has `time` and `kind`:

| kind | fields | meaning (as a signal about the reading) |
|---|---|---|
| `anyway` | `reader`, `index`, `src` | the user pressed **Do it anyway** on a held request: the held reading was probably right (the gate was too careful) |
| `edit` | `reader`, `index`, `suggested` | the user pressed **Edit**: the clearer command went into the message box |
| `edit-sent` | `reader`, `index`, `sent`, `same` | the next message sent after an Edit: `sent` its text, `same` = unchanged suggestion. A changed suggestion says where the reading was wrong |
| `superseded` | `reader`, `index`, `by` (turn) | a later executed command with the same action on the same shapes replaced the held request |
| `undo-next` | `by` (`button` \| `message`) | the very next message was an undo (the toolbar button, or an undo VSS-BERT executed): what was executed was probably wrong |

## To a test set

```
python3 training/sketch/collect_to_bench.py sop-requests-2026-11-03-1530.jsonl --out training/sketch/llm_bench/collected_01 [--via typed,voice] [--dedupe]
```

writes `texts/texts_01.jsonl` (id, domain, names, text: saved before annotation, as AGENTS.md asks), `batch_01.jsonl` (the same rows with
`wires: []`: annotate here, with the short3 conventions), `context/context_01.jsonl` (everything else of each entry, by id; for a blind
annotation do not open it before the gold is written) and a README with the counts. Ids are `col-0001`, ... (`--prefix`). It reads
format 1 and format 2 entries, also mixed in one file.

## Format 1 (`sop-collect/1`, 2026-11-03 morning)

The same fields except `models` and `decision`, plus: `read` (the text after the spell checker, when it changed it), `spell` ([{from,
to}]), `cut` ({by, units}), and `readings`: {rules, vss, neural, combined}, each with `status`, `ms`, `sop` (the reader's SOP Lang),
`wires` (fresh2 wires, with `span` from the gate's units), and for the gated readers `gate` {level, threshold}, `units` (index, src, conf,
execute, wires, reasons when held), `executed`, `held`, and `names` when the reader's own drawing differed. VSS-BERT's decision of format 2
is `readings.combined.units` of format 1.
