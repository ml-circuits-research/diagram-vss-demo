# Fix 1 + fix 2 together on the 7 worlds (pre-registered 2026-11-02, before the run)

**What.** The G7 composer with both fixes, each measured alone first:
- fix 1 (CREATE_COLOR.md): the world `shapes7c` (actions create, set, resize, fact, rule; the colour of a new shape is the event role
  `color`) in place of `shapes7`. Alone: missed its per-action threshold; on the composer sample 71.3 / 12.6 / 16.1, extra 323.
- fix 2 (EVENT_HINT.md, H1): the event cutter's hint re-reads a unit whose reading has no verb. Alone: 73.2 / 14.8 / 12.1, extra 300.

**Measure.** The fixed 1000-message sample (planA/sampleF, 4858 gold requests), `PAIR=value SEG=composer`, registry = G7 with
micro/shapes7c and `"event_cutter": "micro/cutter_events.json"`, `"event_hint": "H1"` (scratch combo/registry_g7c_h1.json).

**Threshold: "it worked"** (against the better single fix, H1): right >= 73.2 + 1.0 = 74.2; wrong <= 14.8; extra <= 330 (G7 321 + ~3%).

**If it misses.** Stop and report. If it passes, it is the candidate for the demo registry; the owner decides.

## Result

Run 2026-11-02, the command above.

| run | right / wrong / not done | extra |
|---|---|---|
| G7 | 69.6 / 14.3 / 16.1 | 321 |
| fix 2 alone (H1) | 73.2 / 14.8 / 12.1 | 300 |
| fix 1 + fix 2 | 74.9 / 13.1 / 12.0 | 302 |

Verdict: **it worked** (right 74.9 >= 74.2, wrong 13.1 <= 14.8, extra 302 <= 330). Against G7, +260 right requests (3640 of 4858):
set +133 (verbless set requests now read, fix 2), create +93 (the colour, fix 1), exists +7, connect +6, count +5; no action loses.
Against G16 with the _w worlds (A3: 72.8 / 11.5 / 15.7, extra 318): +2.1 right, +1.6 wrong, 16 fewer extra.
Event hint: 295 readings re-read, 240 units changed (as H1 alone). Candidate for the demo registry; the owner decides.
