### Per annotated span: number of readings the cut makes in it (kept centres; found centres in brackets)

| model | n | spans (found) | cut right | alone right |
|---|---|---|---|---|
| fix | 0 | 146 (144) | 8 (5.5%) | 27 (18.5%) |
| fix | 1 | 841 (824) | 473 (56.2%) | 571 (67.9%) |
| fix | 2 | 124 (140) | 49 (39.5%) | 79 (63.7%) |
| fix | 3+ | 15 (18) | 0 (0.0%) | 10 (66.7%) |
| fix | all | 1126 | 530 (47.1%) | 687 (61.0%) |
| m0 | 0 | 144 (144) | 10 (6.9%) | 28 (19.4%) |
| m0 | 1 | 842 (824) | 499 (59.3%) | 597 (70.9%) |
| m0 | 2 | 125 (140) | 54 (43.2%) | 80 (64.0%) |
| m0 | 3+ | 15 (18) | 0 (0.0%) | 11 (73.3%) |
| m0 | all | 1126 | 563 (50.0%) | 716 (63.6%) |
| fv2 | 0 | 126 (125) | 7 (5.6%) | 35 (27.8%) |
| fv2 | 1 | 810 (789) | 454 (56.0%) | 552 (68.1%) |
| fv2 | 2 | 175 (194) | 49 (28.0%) | 118 (67.4%) |
| fv2 | 3+ | 15 (18) | 0 (0.0%) | 10 (66.7%) |
| fv2 | all | 1126 | 510 (45.3%) | 715 (63.5%) |
| centres2 | 0 | 168 (99) | 0 (0.0%) | 32 (19.0%) |
| centres2 | 1 | 914 (782) | 547 (59.8%) | 660 (72.2%) |
| centres2 | 2 | 44 (190) | 23 (52.3%) | 24 (54.5%) |
| centres2 | 3+ | 0 (55) | 0 (-) | 0 (-) |
| centres2 | all | 1126 | 570 (50.6%) | 716 (63.6%) |

### Extra wires by source

| source | fix | m0 | fv2 | centres2 |
|---|---|---|---|---|
| second centre in a span | 158 | 157 | 213 | 42 |
| centre outside every span, sentence holds a span | 86 | 86 | 83 | 0 |
| the span's only reading, act differs from the gold | 44 | 38 | 42 | 53 |
| centre outside every span, sentence holds no span | 47 | 47 | 48 | 0 |
| centre outside every span | 0 | 0 | 0 | 49 |
| total | 335 | 328 | 386 | 144 |

### Missed requests (cut not right) by first cause; in brackets those the reader gets right ALONE (lost by the cut)

| cause | fix | m0 | fv2 | centres2 |
|---|---|---|---|---|
| one centre, the per-stretch score left span words out | 101 (8) | 90 (12) | 81 (5) | 116 (45) |
| split: 2+ readings in the span | 90 (46) | 86 (43) | 141 (85) | 21 (5) |
| one centre, stretch = span, read differently | 55 (3) | 58 (3) | 57 (3) | 154 (47) |
| one centre, stretch takes words outside the span | 77 (31) | 72 (33) | 65 (25) | 23 (10) |
| no centre: no event token even alone | 59 (0) | 62 (0) | 41 (0) | 71 (0) |
| one centre, span words taken by a neighbour stretch | 67 (58) | 69 (55) | 61 (50) | 1 (0) |
| one centre, stretch bounded by a second event token of the span | 32 (12) | 20 (6) | 45 (12) | 68 (40) |
| no centre: no event token even alone [words taken by a neighbour stretch] | 31 (0) | 28 (0) | 18 (0) | 21 (0) |
| no centre: event token only in the span's own normalization (rule context in the sentence) [words taken by a neighbour stretch] | 30 (15) | 28 (11) | 35 (16) | 1 (1) |
| one centre, the per-stretch score left span words out (+ takes outside words) | 27 (8) | 26 (7) | 31 (13) | 2 (0) |
| centre(s) found, all rejected (null >= 0.5) or unknown-event / no-sense | 0 (0) | 0 (0) | 0 (0) | 67 (29) |
| no centre: the span's event token skipped by the scan (it resumes after the first FIRED rule) [words taken by a neighbour stretch] | 7 (2) | 6 (5) | 13 (8) | 0 (0) |
| one centre, stretch bounded by a second event token of the span (+ takes outside words) | 4 (3) | 3 (1) | 10 (7) | 3 (0) |
| no centre: event token only in the span's own normalization (rule context in the sentence) | 4 (1) | 5 (2) | 4 (1) | 6 (1) |
| no centre: the span's event token skipped by the scan (it resumes after the first FIRED rule) | 5 (2) | 5 (2) | 7 (4) | 0 (0) |
| one centre, span words taken by a neighbour stretch (+ takes outside words) | 5 (3) | 5 (3) | 6 (3) | 0 (0) |
| centre(s) found, dropped by the DP | 2 (1) | 0 (0) | 0 (0) | 0 (0) |
| centre(s) found, all rejected (null >= 0.5) or unknown-event / no-sense [words taken by a neighbour stretch] | 0 (0) | 0 (0) | 0 (0) | 2 (1) |
| centre(s) found, dropped by the DP [words taken by a neighbour stretch] | 0 (0) | 0 (0) | 1 (0) | 0 (0) |
| total | 596 (193) | 563 (183) | 616 (232) | 556 (179) |

### Mechanisms: lost requests (alone right, cut not) / extra wires

| mechanism | fix | m0 | fv2 | centres2 |
|---|---|---|---|---|
| M1a | 30 / 60 | 26 / 60 | 32 / 67 | 0 / 0 |
| M1b | 13 / 15 | 5 / 13 | 15 / 16 | 23 / 35 |
| M1c | 0 / 2 | 0 / 2 | 1 / 4 | 1 / 3 |
| M2 | 19 / 81 | 19 / 82 | 56 / 126 | 32 / 4 |
| M3 | 61 / 0 | 58 / 0 | 53 / 0 | 1 / 0 |
| M5 | 20 / 0 | 20 / 0 | 29 / 0 | 2 / 0 |
| M6 | 3 / 44 | 3 / 38 | 3 / 42 | 0 / 53 |
| M7 | 47 / 0 | 52 / 0 | 43 / 0 | 102 / 0 |
| M8 | 0 / 133 | 0 / 133 | 0 / 131 | 0 / 49 |
| M9 | 0 / 0 | 0 / 0 | 0 / 0 | 18 / 0 |

fix: second-centre token sequences (per extra wire): extreme_q + extreme_q 35, path_q + path_q 15, connect + connect 14, path_q + path_q + path_q 12, nearest_q + nearest_q + path_q 10, arrange + arrange 9, connected_q + connected_q 8, nearest_q + nearest_q 5, draw + connect + path_q 4, move + move 3, which + reach_q + path_q 3, forget + which 3
fix: extra wires by centre token: is 85, path_q 41, extreme_q 37, connect 29, connected_q 21, move 20, which 16, arrange 12, nearest_q 11, draw 10, delete 10, make 8

m0: second-centre token sequences (per extra wire): extreme_q + extreme_q 35, path_q + path_q 15, connect + connect 14, path_q + path_q + path_q 12, nearest_q + nearest_q + path_q 10, arrange + arrange 9, connected_q + connected_q 8, nearest_q + nearest_q 5, move + move 4, draw + connect + path_q 4, which + reach_q + path_q 3, forget + which 3
m0: extra wires by centre token: is 84, path_q 41, extreme_q 37, connect 29, move 21, which 16, connected_q 16, arrange 12, nearest_q 11, draw 10, delete 10, make 9

fv2: second-centre token sequences (per extra wire): extreme_q + extreme_q 34, move + move 30, path_q + path_q 15, connect + connect 13, path_q + path_q + path_q 12, arrange + arrange 11, nearest_q + nearest_q + path_q 10, connected_q + connected_q 8, make + make 7, reach_q + path_q 6, nearest_q + nearest_q 5, is_q + make 4
fv2: extra wires by centre token: is 85, path_q 44, move 42, extreme_q 36, connect 29, make 23, connected_q 21, arrange 14, which 13, is_q 11, nearest_q 11, draw 10

centres2: second-centre token sequences (per extra wire): is + is_q 14, is + connected_q 9, draw + connect 4, is + path_q 4, draw + move 1, draw + make 1, connect + connect 1, move + move 1, which + neigh_q 1, is + extreme_q 1, which + extreme_q 1, is + nearest_q 1
centres2: extra wires by centre token: is 79, draw 10, move 10, which 8, connect 7, connected_q 6, delete 5, make 4, extreme_q 3, send 3, cycle_q 2, redo 2
