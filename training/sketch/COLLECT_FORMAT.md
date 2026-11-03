# Collected requests: the file format (`sop-collect/1`)

The demo keeps every message the user sends in the browser's localStorage (owner, 2026-11-03: "request collection to improve the test
data"), with what each reader read, what VSS-BERT executed or held, and what the user did about it later. Nothing leaves the browser
unless the user downloads the file: ⋮ › Settings › Collected requests › **Download as JSONL** (`sop-requests-YYYY-MM-DD-HHMM.jsonl`).

Code: `docs/js/collect.js` (the store and `buildEntry`), hooks in `docs/js/ui.js`; tests `training/sketch/test_collect.mjs` (node) and
`training/sketch/test_voice_collect_ui.py` (browser). Converter to an un-annotated llm_bench folder: `training/sketch/collect_to_bench.py`.

## Storage

- One localStorage key, `sop.collect.v1`: a JSON array of entries, oldest first. At most the last **5000** entries (older ones are dropped).
- When the browser refuses a write (quota), the oldest tenth of the entries is dropped and the write is tried again until it fits; the
  Settings section says how many were dropped. When the storage cannot be used at all (private window, blocked site data), the entries
  are kept in memory for the page only, and the section says so.
- The switch (on by default) is `sop.collect.off` = `"1"` when the user turned collection off.
- Collected: messages typed in the message box, sent from the voice popup, example sentences and the reply chips. Not collected: the
  opening message the page sends by itself, SOP Lang typed with `@`, and the toolbar buttons (their Undo is recorded as an event of the
  message before it, see `undo-next`).

## One line = one entry

The file is JSON Lines: one entry per line, UTF-8, oldest first. Fields (the ones in **bold** map one to one onto a fresh2 / short3 row,
`training/sketch/llm_bench/fresh2/README.md`):

| field | type | what it is |
|---|---|---|
| `format` | `"sop-collect/1"` | the format of this file |
| `id` | string | `c-<time base36>-<random>`, unique per entry |
| `time` | ISO 8601 UTC | when the message was sent |
| `session`, `turn` | string, int | the page session (one per page load) and the message's number in it; the events find their entry by these |
| **`domain`** | string | always `"collected from the demo"` |
| **`names`** | [string] | the shapes and groups on the drawing of the VSS-BERT tab before the message (fresh2 `names`) |
| **`text`** | string | the message as sent, in English, before the spell checker (for a message that came through voice or translation, the English text that was sent) |
| `read` | string | the text the readers read, when the spell checker changed it |
| `spell` | [{from, to}] | the spell checker's changes |
| `source` | object | `via`: `typed` (message box or the popup's text box), `voice` (spoken in the popup), `example`, `chip` (a reply's button), `script`, `help`, `other`; `lang`: the BCP-47 tag chosen in the popup; `original`: the words spoken or typed in that language; `translation`: {`by`: `builtin` (the browser's on-device Translator) \| `online` (MyMemory, only when the user opted in) \| `none` (no translation: the text was sent as it was), `edited`: the user changed the English before sending} |
| `cut` | {by, units: [string]} | how the message was cut into requests (the cutter, the requests' words); every reader read these |
| `tab` | string | the tab shown when the message was sent (`combined` = VSS-BERT) |
| `reply` | string | the text of VSS-BERT's line in the chat |
| `readings` | {rules, vss, neural, combined} | what each reader read (below); `combined` is VSS-BERT, `neural` is SOP-BERT |
| `events` | [event] | what the user did later (below) |
| **`wires`** | `[]` | **the gold: empty, to be annotated** |

### `readings.<reader>`

| field | what it is |
|---|---|
| `status` | `read`, `off` (the reader was not loaded: `note` says why), `error` (`error` has the message) |
| `ms` | the time the reader took to formalize the message |
| `sop` | the reader's SOP Lang for the whole message, one wire per line (also the requests the gate held) |
| `wires` | the same as fresh2 wires: `[{span?, type, args}]`: mention wires folded into their users (`mention(color=red,shape=circle)`, keys sorted), a reference to another wire of the message as `$new`, lists comma-joined, names as written. `span` = the words of the request when the reader's gate knows them. No `trigger` (the readers do not report one). |
| `gate` | {level, threshold}: the gate level (`cost` = the safety threshold) and its threshold (a number, or one per command / question) |
| `units` | per request: `index`, `src` (its words), `conf` (the confidence), `execute` (cleared the threshold), `wires` (its reading), `reasons` (only when held: why the reader was not sure, as the reply says it) |
| `executed`, `held` | the indices of the units executed and held |
| `names` | the reader's own drawing, only when it differs from `names` |

The Rules have no gate, so no `gate` / `units` / `executed` / `held`: everything they read was executed.

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
annotation do not open it before the gold is written) and a README with the counts. Ids are `col-0001`, ... (`--prefix`).
