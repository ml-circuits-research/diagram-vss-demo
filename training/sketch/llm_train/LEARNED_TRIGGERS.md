# Triggers learned from 1200 training messages

807 rules kept (count >= 2, share >= 0.75, precision >= 0.6; precision counts the phrase's occurrences in 1477 fluff sentences). Action phrases passed to the rules: 54.

| phrase | before | after | n | events | in fluff | precision | kept |
|---|---|---|---|---|---|---|---|
| connect | * | * | 613 | {'connect': 612, 'connected_q': 1} | 9 | 0.98 | yes |
| connect | B | * | 583 | {'connect': 583} | 6 | 0.99 | yes |
| connect | * | NAME | 551 | {'connect': 551} | 1 | 1.0 | yes |
| connect | B | NAME | 523 | {'connect': 523} | 1 | 1.0 | yes |
| make | * | * | 499 | {'make': 490, 'draw': 5, 'resize': 3} | 8 | 0.96 | yes |
| make | B | * | 498 | {'make': 489, 'draw': 5, 'resize': 3} | 4 | 0.97 | yes |
| make | * | THE | 353 | {'make': 351, 'resize': 1, 'connect': 1} | 2 | 0.99 | yes |
| make | B | THE | 352 | {'make': 350, 'resize': 1, 'connect': 1} | 1 | 0.99 | yes |
| move | * | * | 239 | {'move': 239} | 4 | 0.96 | yes |
| move | B | * | 238 | {'move': 238} | 0 | 1.0 | yes |
| set | B | * | 238 | {'make': 238} | 1 | 1.0 | yes |
| set | * | * | 238 | {'make': 238} | 6 | 0.96 | yes |
| set | B | THE | 207 | {'make': 207} | 0 | 1.0 | yes |
| set | * | THE | 207 | {'make': 207} | 0 | 1.0 | yes |
| move | * | NAME | 152 | {'move': 152} | 0 | 1.0 | yes |
| move | B | NAME | 151 | {'move': 151} | 0 | 1.0 | yes |
| put | B | THE | 131 | {'move': 130, 'arrange': 1} | 0 | 0.91 | yes |
| put | * | THE | 131 | {'move': 130, 'arrange': 1} | 0 | 0.91 | yes |
| create | B | ART | 125 | {'draw': 125} | 0 | 1.0 | yes |
| create | * | ART | 125 | {'draw': 125} | 0 | 1.0 | yes |
| create | B | * | 125 | {'draw': 125} | 0 | 1.0 | yes |
| create | * | * | 125 | {'draw': 125} | 0 | 1.0 | yes |
| put | B | ART | 107 | {'draw': 106, 'connect': 1} | 0 | 0.98 | yes |
| put | * | ART | 107 | {'draw': 106, 'connect': 1} | 0 | 0.98 | yes |
| is | NAME | * | 101 | {'is': 101} | 4 | 0.93 | yes |
| move | B | THE | 84 | {'move': 84} | 0 | 1.0 | yes |
| move | * | THE | 84 | {'move': 84} | 0 | 1.0 | yes |
| make | B | NAME | 83 | {'make': 83} | 0 | 1.0 | yes |
| make | * | NAME | 83 | {'make': 83} | 0 | 1.0 | yes |
| link | * | * | 83 | {'connect': 83} | 9 | 0.79 | yes |
| is | NAME | O | 82 | {'is': 82} | 2 | 0.95 | yes |
| duplicate | B | * | 81 | {'duplicate': 81} | 0 | 1.0 | yes |
| duplicate | * | * | 81 | {'duplicate': 81} | 0 | 1.0 | yes |
| link | B | * | 80 | {'connect': 80} | 4 | 0.95 | yes |
| rename | B | * | 77 | {'rename': 77} | 0 | 1.0 | yes |
| rename | * | * | 77 | {'rename': 77} | 0 | 1.0 | yes |
| bigger than | * | * | 73 | {'is_q': 73} | 1 | 0.99 | yes |
| bigger than | NAME | * | 71 | {'is_q': 71} | 0 | 1.0 | yes |
| duplicate | B | NAME | 67 | {'duplicate': 67} | 0 | 1.0 | yes |
| duplicate | * | NAME | 67 | {'duplicate': 67} | 0 | 1.0 | yes |
| arrange | B | * | 64 | {'arrange': 64} | 0 | 1.0 | yes |
| arrange | * | * | 64 | {'arrange': 64} | 0 | 0.98 | yes |
| is there | B | * | 62 | {'path_q': 59, 'cycle_q': 2, 'is_there': 1} | 2 | 0.65 | yes |
| is there | * | * | 62 | {'path_q': 59, 'cycle_q': 2, 'is_there': 1} | 2 | 0.65 | yes |
| put | B | NAME | 62 | {'move': 60, 'arrange': 1, 'bring': 1} | 0 | 0.89 | yes |
| put | * | NAME | 62 | {'move': 60, 'arrange': 1, 'bring': 1} | 0 | 0.89 | yes |
| link | * | NAME | 61 | {'connect': 61} | 0 | 1.0 | yes |
| is there | B | ART | 61 | {'path_q': 59, 'cycle_q': 2} | 1 | 0.72 | yes |
| is there | * | ART | 61 | {'path_q': 59, 'cycle_q': 2} | 1 | 0.72 | yes |
| rename | B | NAME | 59 | {'rename': 59} | 0 | 1.0 | yes |
| rename | * | NAME | 59 | {'rename': 59} | 0 | 1.0 | yes |
| link | B | NAME | 58 | {'connect': 58} | 0 | 1.0 | yes |
| label | * | * | 53 | {'label': 42, 'what_says': 8, 'connect': 3} | 6 | 0.71 | yes |
| delete | * | * | 51 | {'delete': 51} | 15 | 0.72 | yes |
| add | B | ART | 50 | {'draw': 38, 'connect': 12} | 0 | 0.81 | yes |
| add | * | ART | 50 | {'draw': 38, 'connect': 12} | 0 | 0.81 | yes |
| delete | B | * | 50 | {'delete': 50} | 13 | 0.79 | yes |
| in | * | THE | 50 | {'move': 50} | 13 | 0.76 | yes |
| biggest | * | * | 49 | {'extreme_q': 49} | 2 | 0.92 | yes |
| connected to | * | * | 48 | {'connected_q': 41, 'neigh_q': 4, 'connect': 3} | 2 | 0.84 | yes |
| leftmost | * | * | 48 | {'extreme_q': 48} | 0 | 1.0 | yes |
| how many | * | * | 47 | {'how_many': 46, 'degree_q': 1} | 4 | 0.9 | yes |
| which shapes are | B | O | 47 | {'which': 47} | 0 | 0.87 | yes |
| which shapes are | * | O | 47 | {'which': 47} | 0 | 0.87 | yes |
| which shapes are | B | * | 47 | {'which': 47} | 0 | 0.85 | yes |
| which shapes are | * | * | 47 | {'which': 47} | 0 | 0.85 | yes |
| in | NAME | THE | 47 | {'move': 47} | 0 | 1.0 | yes |
| in | NAME | * | 47 | {'move': 47} | 0 | 0.73 | yes |
| how many | * | O | 46 | {'how_many': 45, 'degree_q': 1} | 4 | 0.9 | yes |
| biggest | THE | * | 46 | {'extreme_q': 46} | 1 | 0.94 | yes |
| how many | B | * | 45 | {'how_many': 44, 'degree_q': 1} | 3 | 0.92 | yes |
| bigger than | NAME | NAME | 45 | {'is_q': 45} | 0 | 1.0 | yes |
| bigger than | * | NAME | 45 | {'is_q': 45} | 0 | 1.0 | yes |
| topmost | * | * | 45 | {'extreme_q': 44, 'is_q': 1} | 0 | 0.98 | yes |
| align | B | * | 45 | {'align': 45} | 0 | 1.0 | yes |
| align | * | * | 45 | {'align': 45} | 0 | 0.98 | yes |
| undo | * | * | 45 | {'undo': 45} | 3 | 0.92 | yes |
| reachable from | * | * | 45 | {'path_q': 38, 'reach_q': 7} | 0 | 0.87 | yes |
| how many | B | O | 44 | {'how_many': 43, 'degree_q': 1} | 3 | 0.92 | yes |
| describe | * | * | 44 | {'describe': 44} | 0 | 1.0 | yes |
| undo | B | * | 44 | {'undo': 44} | 2 | 0.96 | yes |
| arrange | B | NAME | 44 | {'arrange': 44} | 0 | 1.0 | yes |
| arrange | * | NAME | 44 | {'arrange': 44} | 0 | 1.0 | yes |
| describe | B | * | 43 | {'describe': 43} | 0 | 1.0 | yes |
| rightmost | * | * | 42 | {'extreme_q': 41, 'is_q': 1} | 0 | 0.98 | yes |
| closest | * | * | 41 | {'nearest_q': 41} | 1 | 0.95 | yes |
| leftmost | THE | * | 40 | {'extreme_q': 40} | 0 | 1.0 | yes |
| connected to | NAME | * | 40 | {'connected_q': 39, 'neigh_q': 1} | 0 | 0.98 | yes |
| delete | * | THE | 39 | {'delete': 39} | 11 | 0.78 | yes |
| swap | B | * | 39 | {'swap': 39} | 3 | 0.93 | yes |
| swap | * | * | 39 | {'swap': 39} | 5 | 0.87 | yes |
| smaller than | * | * | 39 | {'is_q': 39} | 0 | 1.0 | yes |
| forget | * | * | 39 | {'forget': 39} | 2 | 0.95 | yes |
| closest | * | O | 39 | {'nearest_q': 39} | 1 | 0.97 | yes |
| delete | B | THE | 38 | {'delete': 38} | 10 | 0.79 | yes |
| topmost | THE | * | 38 | {'extreme_q': 37, 'is_q': 1} | 0 | 0.97 | yes |
| reachable from | * | NAME | 38 | {'path_q': 31, 'reach_q': 7} | 0 | 0.84 | yes |
| chain | B | * | 38 | {'connect': 38} | 2 | 0.95 | yes |
| connect | * | PRON | 37 | {'connect': 37} | 5 | 0.88 | yes |
| is | B | THE | 37 | {'is_q': 37} | 4 | 0.73 | yes |
| forget | B | * | 37 | {'forget': 37} | 0 | 1.0 | yes |
| smaller than | NAME | * | 37 | {'is_q': 37} | 0 | 1.0 | yes |
| connect | B | PRON | 36 | {'connect': 36} | 4 | 0.9 | yes |
| smallest | * | * | 36 | {'extreme_q': 36} | 0 | 0.95 | yes |
| most connected | * | * | 36 | {'extreme_q': 36} | 1 | 0.97 | yes |
| make | B | PRON | 36 | {'make': 35, 'resize': 1} | 2 | 0.92 | yes |
| make | * | PRON | 36 | {'make': 35, 'resize': 1} | 2 | 0.9 | yes |
| rightmost | THE | * | 35 | {'extreme_q': 34, 'is_q': 1} | 0 | 0.97 | yes |
| cycle | * | * | 35 | {'cycle_q': 35} | 5 | 0.88 | yes |
| redo | * | * | 34 | {'redo': 34} | 1 | 0.97 | yes |
| most connected | THE | * | 34 | {'extreme_q': 34} | 1 | 0.97 | yes |
| biggest | * | B | 34 | {'extreme_q': 34} | 0 | 1.0 | yes |
| reachable from | NAME | * | 34 | {'path_q': 34} | 0 | 1.0 | yes |
| connected to | * | NAME | 33 | {'connected_q': 31, 'neigh_q': 1, 'connect': 1} | 0 | 0.94 | yes |
| leftmost | * | B | 33 | {'extreme_q': 33} | 0 | 1.0 | yes |
| redo | B | * | 33 | {'redo': 33} | 0 | 1.0 | yes |
| is | B | NAME | 32 | {'is_q': 32} | 2 | 0.6 | yes |
| smallest | * | B | 32 | {'extreme_q': 32} | 0 | 1.0 | yes |
| bottommost | * | * | 32 | {'extreme_q': 32} | 0 | 1.0 | yes |
| align | B | NAME | 31 | {'align': 31} | 0 | 1.0 | yes |
| align | * | NAME | 31 | {'align': 31} | 0 | 1.0 | yes |
| rightmost | * | B | 31 | {'extreme_q': 30, 'is_q': 1} | 0 | 0.97 | yes |
| topmost | * | B | 31 | {'extreme_q': 31} | 0 | 1.0 | yes |
| biggest | THE | B | 31 | {'extreme_q': 31} | 0 | 1.0 | yes |
| connect | O | * | 30 | {'connect': 29, 'connected_q': 1} | 2 | 0.91 | yes |
| swap | B | NAME | 30 | {'swap': 30} | 3 | 0.91 | yes |
| swap | * | NAME | 30 | {'swap': 30} | 4 | 0.88 | yes |
| closest to | * | * | 29 | {'nearest_q': 29} | 1 | 0.97 | yes |
| disconnect | * | * | 29 | {'disconnect': 29} | 0 | 0.97 | yes |
| smallest | THE | * | 29 | {'extreme_q': 29} | 0 | 0.94 | yes |
| connected to | NAME | NAME | 29 | {'connected_q': 29} | 0 | 1.0 | yes |
| bottom | * | B | 29 | {'move': 29} | 0 | 0.97 | yes |
| bottom | * | * | 29 | {'move': 29} | 0 | 0.88 | yes |
| connect | O | NAME | 28 | {'connect': 28} | 0 | 1.0 | yes |
| disconnect | B | * | 28 | {'disconnect': 28} | 0 | 1.0 | yes |
| count | B | * | 28 | {'how_many': 28} | 0 | 1.0 | yes |
| count | * | * | 28 | {'how_many': 28} | 1 | 0.97 | yes |
| bottommost | * | B | 28 | {'extreme_q': 28} | 0 | 1.0 | yes |
| bottom | NAME | B | 28 | {'move': 28} | 0 | 0.97 | yes |
| bottom | NAME | * | 28 | {'move': 28} | 0 | 0.93 | yes |
| reachable from | NAME | NAME | 28 | {'path_q': 28} | 0 | 1.0 | yes |
| bigger than | * | THE | 27 | {'is_q': 27} | 0 | 1.0 | yes |
| closest to | * | NAME | 27 | {'nearest_q': 27} | 1 | 0.96 | yes |
| disconnect | * | NAME | 27 | {'disconnect': 27} | 0 | 1.0 | yes |
| label | B | * | 27 | {'label': 25, 'connect': 2} | 1 | 0.9 | yes |
| forget | * | THE | 27 | {'forget': 27} | 0 | 1.0 | yes |
| bottommost | THE | * | 27 | {'extreme_q': 27} | 0 | 1.0 | yes |
| colour | B | * | 27 | {'make': 27} | 0 | 1.0 | yes |
| colour | * | * | 27 | {'make': 27} | 1 | 0.93 | yes |
| disconnect | B | NAME | 26 | {'disconnect': 26} | 0 | 1.0 | yes |
| describe | * | THE | 26 | {'describe': 26} | 0 | 1.0 | yes |
| smaller than | * | NAME | 26 | {'is_q': 26} | 0 | 1.0 | yes |
| leftmost | THE | B | 26 | {'extreme_q': 26} | 0 | 1.0 | yes |
| farthest | * | * | 26 | {'nearest_q': 26} | 0 | 1.0 | yes |
| bigger than | NAME | THE | 25 | {'is_q': 25} | 0 | 1.0 | yes |
| directly linked | NAME | * | 25 | {'connected_q': 25} | 0 | 1.0 | yes |
| directly linked | * | * | 25 | {'connected_q': 25} | 0 | 1.0 | yes |
| describe | B | THE | 25 | {'describe': 25} | 0 | 1.0 | yes |
| distribute | B | * | 25 | {'distribute': 25} | 0 | 1.0 | yes |
| distribute | * | * | 25 | {'distribute': 25} | 0 | 0.96 | yes |
| forget | B | THE | 25 | {'forget': 25} | 0 | 1.0 | yes |
| least connected | * | * | 25 | {'extreme_q': 25} | 0 | 1.0 | yes |
| smallest | THE | B | 25 | {'extreme_q': 25} | 0 | 1.0 | yes |
| enlarge | B | * | 25 | {'resize': 25} | 0 | 1.0 | yes |
| enlarge | * | * | 25 | {'resize': 25} | 0 | 1.0 | yes |
| at | NAME | THE | 25 | {'move': 25} | 0 | 0.86 | yes |
| at | NAME | * | 25 | {'move': 25} | 0 | 0.86 | yes |
| directly linked | NAME | O | 24 | {'connected_q': 24} | 0 | 1.0 | yes |
| directly linked | * | O | 24 | {'connected_q': 24} | 0 | 1.0 | yes |
| rightmost | THE | B | 24 | {'extreme_q': 23, 'is_q': 1} | 0 | 0.96 | yes |
| most connected | * | B | 24 | {'extreme_q': 24} | 0 | 1.0 | yes |
| smaller than | NAME | NAME | 24 | {'is_q': 24} | 0 | 1.0 | yes |
| topmost | THE | B | 24 | {'extreme_q': 24} | 0 | 1.0 | yes |
| closest | O | O | 24 | {'nearest_q': 24} | 0 | 1.0 | yes |
| closest | O | * | 24 | {'nearest_q': 24} | 0 | 0.96 | yes |
| chain | * | PRON | 24 | {'connect': 24} | 2 | 0.92 | yes |
| degree | * | * | 24 | {'degree_q': 24} | 0 | 1.0 | yes |
| set | B | NAME | 23 | {'make': 23} | 0 | 1.0 | yes |
| set | * | NAME | 23 | {'make': 23} | 0 | 1.0 | yes |
| bottommost | THE | B | 23 | {'extreme_q': 23} | 0 | 1.0 | yes |
| top | * | * | 23 | {'move': 23} | 1 | 0.82 | yes |
| cycle | * | B | 23 | {'cycle_q': 23} | 0 | 1.0 | yes |
| make | B | O | 22 | {'make': 21, 'resize': 1} | 1 | 0.92 | yes |
| make | * | O | 22 | {'make': 21, 'resize': 1} | 4 | 0.81 | yes |
| most connected | THE | B | 22 | {'extreme_q': 22} | 0 | 1.0 | yes |
| draw | B | * | 22 | {'draw': 19, 'connect': 3} | 1 | 0.85 | yes |
| rules | THE | * | 22 | {'which': 22} | 1 | 0.61 | yes |
| undo | * | PRON | 21 | {'undo': 21} | 1 | 0.95 | yes |
| least connected | * | B | 21 | {'extreme_q': 21} | 0 | 1.0 | yes |
| undo | B | THE | 21 | {'undo': 21} | 2 | 0.91 | yes |
| undo | * | THE | 21 | {'undo': 21} | 2 | 0.91 | yes |
| count | B | THE | 21 | {'how_many': 21} | 0 | 1.0 | yes |
| count | * | THE | 21 | {'how_many': 21} | 0 | 1.0 | yes |
| cycle | ART | * | 21 | {'cycle_q': 21} | 0 | 1.0 | yes |
| draw | B | ART | 21 | {'draw': 19, 'connect': 2} | 0 | 0.91 | yes |
| draw | * | ART | 21 | {'draw': 19, 'connect': 2} | 1 | 0.88 | yes |
| chain | B | PRON | 21 | {'connect': 21} | 2 | 0.91 | yes |
| neighbors | * | * | 21 | {'neigh_q': 21} | 0 | 1.0 | yes |
| how many shapes | B | O | 20 | {'how_many': 20} | 3 | 0.83 | yes |
| how many shapes | * | O | 20 | {'how_many': 20} | 3 | 0.83 | yes |
| how many shapes | B | * | 20 | {'how_many': 20} | 3 | 0.83 | yes |
| how many shapes | * | * | 20 | {'how_many': 20} | 3 | 0.83 | yes |
| undo | B | PRON | 20 | {'undo': 20} | 0 | 1.0 | yes |
| least connected | THE | * | 20 | {'extreme_q': 20} | 0 | 1.0 | yes |
| shrink | B | * | 20 | {'resize': 20} | 0 | 1.0 | yes |
| shrink | * | * | 20 | {'resize': 20} | 0 | 0.91 | yes |
| farthest | * | O | 20 | {'nearest_q': 20} | 0 | 1.0 | yes |
| top | * | B | 20 | {'move': 20} | 0 | 0.95 | yes |
| top | NAME | * | 20 | {'move': 20} | 0 | 0.95 | yes |
| connect | * | O | 19 | {'connect': 18, 'connected_q': 1} | 3 | 0.83 | yes |
| degree | THE | O | 19 | {'degree_q': 19} | 0 | 1.0 | yes |
| degree | * | O | 19 | {'degree_q': 19} | 0 | 1.0 | yes |
| degree | THE | * | 19 | {'degree_q': 19} | 0 | 1.0 | yes |
| mostconnected | * | * | 18 | {'extreme_q': 18} | 0 | 1.0 | yes |
| connect | B | O | 18 | {'connect': 18} | 1 | 0.95 | yes |
| colour | B | THE | 18 | {'make': 18} | 0 | 1.0 | yes |
| colour | * | THE | 18 | {'make': 18} | 0 | 1.0 | yes |
| mostconnected | THE | * | 17 | {'extreme_q': 17} | 0 | 1.0 | yes |
| is | NAME | ART | 17 | {'is': 17} | 0 | 0.94 | yes |
| label | * | THE | 17 | {'label': 14, 'connect': 3} | 2 | 0.77 | yes |
| closest | THE | * | 17 | {'nearest_q': 17} | 1 | 0.94 | yes |
| top | NAME | B | 17 | {'move': 17} | 0 | 1.0 | yes |
| leastconnected | THE | * | 16 | {'extreme_q': 16} | 0 | 1.0 | yes |
| leastconnected | * | * | 16 | {'extreme_q': 16} | 0 | 1.0 | yes |
| label | B | THE | 16 | {'label': 14, 'connect': 2} | 0 | 0.89 | yes |
| least connected | THE | B | 16 | {'extreme_q': 16} | 0 | 1.0 | yes |
| mostconnected | * | B | 16 | {'extreme_q': 16} | 0 | 1.0 | yes |
| rename | B | THE | 16 | {'rename': 16} | 0 | 1.0 | yes |
| rename | * | THE | 16 | {'rename': 16} | 0 | 1.0 | yes |
| farthest | THE | * | 16 | {'nearest_q': 16} | 0 | 1.0 | yes |
| right_side | * | B | 16 | {'move': 16} | 0 | 1.0 | yes |
| right_side | * | * | 16 | {'move': 16} | 0 | 1.0 | yes |
| biggest | THE | O | 15 | {'extreme_q': 15} | 1 | 0.83 | yes |
| biggest | * | O | 15 | {'extreme_q': 15} | 2 | 0.79 | yes |
| how many links | B | * | 15 | {'degree_q': 15} | 0 | 1.0 | yes |
| how many links | * | * | 15 | {'degree_q': 15} | 0 | 1.0 | yes |
| leftmost | * | O | 15 | {'extreme_q': 15} | 0 | 1.0 | yes |
| closest to | THE | NAME | 15 | {'nearest_q': 15} | 1 | 0.94 | yes |
| closest to | THE | * | 15 | {'nearest_q': 15} | 1 | 0.94 | yes |
| farthest from | * | * | 15 | {'nearest_q': 15} | 0 | 1.0 | yes |
| leastconnected | THE | B | 15 | {'extreme_q': 15} | 0 | 1.0 | yes |
| leastconnected | * | B | 15 | {'extreme_q': 15} | 0 | 1.0 | yes |
| mostconnected | THE | B | 15 | {'extreme_q': 15} | 0 | 1.0 | yes |
| describe | B | NAME | 15 | {'describe': 15} | 0 | 1.0 | yes |
| describe | * | NAME | 15 | {'describe': 15} | 0 | 1.0 | yes |
| closest | THE | O | 15 | {'nearest_q': 15} | 1 | 0.94 | yes |
| how many links | B | O | 14 | {'degree_q': 14} | 0 | 1.0 | yes |
| how many links | * | O | 14 | {'degree_q': 14} | 0 | 1.0 | yes |
| leftmost | THE | O | 14 | {'extreme_q': 14} | 0 | 1.0 | yes |
| farthest from | * | NAME | 14 | {'nearest_q': 14} | 0 | 1.0 | yes |
| is there shape | B | O | 14 | {'is_there': 14} | 0 | 0.74 | yes |
| is there shape | * | O | 14 | {'is_there': 14} | 0 | 0.74 | yes |
| is there shape | B | * | 14 | {'is_there': 14} | 0 | 0.74 | yes |
| is there shape | * | * | 14 | {'is_there': 14} | 0 | 0.74 | yes |
| topmost | THE | O | 14 | {'extreme_q': 13, 'is_q': 1} | 0 | 0.93 | yes |
| topmost | * | O | 14 | {'extreme_q': 13, 'is_q': 1} | 0 | 0.93 | yes |
| closest to | O | * | 14 | {'nearest_q': 14} | 0 | 1.0 | yes |
| list | B | * | 14 | {'which': 14} | 0 | 1.0 | yes |
| path | ART | O | 14 | {'path_q': 14} | 0 | 1.0 | yes |
| path | ART | * | 14 | {'path_q': 14} | 0 | 1.0 | yes |
| cycle | ART | B | 14 | {'cycle_q': 14} | 0 | 1.0 | yes |
| right_side | NAME | B | 14 | {'move': 14} | 0 | 1.0 | yes |
| right_side | NAME | * | 14 | {'move': 14} | 0 | 1.0 | yes |
| shrink | B | THE | 14 | {'resize': 14} | 0 | 1.0 | yes |
| shrink | * | THE | 14 | {'resize': 14} | 0 | 1.0 | yes |
| duplicate | B | THE | 13 | {'duplicate': 13} | 0 | 1.0 | yes |
| duplicate | * | THE | 13 | {'duplicate': 13} | 0 | 1.0 | yes |
| smaller than | NAME | THE | 13 | {'is_q': 13} | 0 | 1.0 | yes |
| smaller than | * | THE | 13 | {'is_q': 13} | 0 | 1.0 | yes |
| linked | * | * | 13 | {'connected_q': 11, 'connect': 2} | 5 | 0.62 | yes |
| distribute | B | PRON | 13 | {'distribute': 13} | 0 | 1.0 | yes |
| distribute | * | PRON | 13 | {'distribute': 13} | 0 | 1.0 | yes |
| neighbors | * | O | 13 | {'neigh_q': 13} | 0 | 1.0 | yes |
| closest to | O | NAME | 12 | {'nearest_q': 12} | 0 | 1.0 | yes |
| farthest from | THE | * | 12 | {'nearest_q': 12} | 0 | 1.0 | yes |
| cycle | * | O | 12 | {'cycle_q': 12} | 5 | 0.71 | yes |
| most connected | THE | O | 12 | {'extreme_q': 12} | 1 | 0.92 | yes |
| most connected | * | O | 12 | {'extreme_q': 12} | 1 | 0.92 | yes |
| cycle | O | * | 12 | {'cycle_q': 12} | 4 | 0.75 | yes |
| enlarge | B | THE | 12 | {'resize': 12} | 0 | 1.0 | yes |
| enlarge | * | THE | 12 | {'resize': 12} | 0 | 1.0 | yes |
| neighbors | THE | O | 12 | {'neigh_q': 12} | 0 | 1.0 | yes |
| neighbors | THE | * | 12 | {'neigh_q': 12} | 0 | 1.0 | yes |
| farthest | THE | O | 12 | {'nearest_q': 12} | 0 | 1.0 | yes |
| rules | * | O | 12 | {'which': 12} | 2 | 0.63 | yes |
| rightmost | THE | O | 11 | {'extreme_q': 11} | 0 | 1.0 | yes |
| rightmost | * | O | 11 | {'extreme_q': 11} | 0 | 1.0 | yes |
| resize | * | * | 11 | {'resize': 11} | 1 | 0.92 | yes |
| farthest from | THE | NAME | 11 | {'nearest_q': 11} | 0 | 1.0 | yes |
| linked | NAME | B | 11 | {'connected_q': 11} | 0 | 1.0 | yes |
| linked | * | B | 11 | {'connected_q': 11} | 0 | 1.0 | yes |
| linked | NAME | * | 11 | {'connected_q': 11} | 0 | 1.0 | yes |
| redo | B | PRON | 11 | {'redo': 11} | 0 | 1.0 | yes |
| redo | * | PRON | 11 | {'redo': 11} | 0 | 1.0 | yes |
| link | B | PRON | 11 | {'connect': 11} | 4 | 0.73 | yes |
| link | * | PRON | 11 | {'connect': 11} | 4 | 0.73 | yes |
| put | B | PRON | 11 | {'move': 11} | 0 | 0.61 | yes |
| redo | B | O | 11 | {'redo': 11} | 0 | 1.0 | yes |
| redo | * | O | 11 | {'redo': 11} | 0 | 1.0 | yes |
| anything | * | * | 11 | {'is_there': 11} | 5 | 0.65 | yes |
| resize | B | * | 10 | {'resize': 10} | 1 | 0.91 | yes |
| directly connected | NAME | * | 10 | {'connected_q': 10} | 0 | 1.0 | yes |
| directly connected | * | * | 10 | {'connected_q': 10} | 0 | 1.0 | yes |
| connected to | * | THE | 10 | {'connected_q': 9, 'neigh_q': 1} | 1 | 0.83 | yes |
| label | B | NAME | 10 | {'label': 10} | 0 | 1.0 | yes |
| label | * | NAME | 10 | {'label': 10} | 0 | 1.0 | yes |
| farthest | O | * | 10 | {'nearest_q': 10} | 0 | 1.0 | yes |
| left_side | NAME | B | 10 | {'move': 10} | 0 | 1.0 | yes |
| left_side | * | B | 10 | {'move': 10} | 0 | 0.91 | yes |
| left_side | NAME | * | 10 | {'move': 10} | 0 | 0.91 | yes |
| left_side | * | * | 10 | {'move': 10} | 0 | 0.83 | yes |
| remove | B | THE | 10 | {'disconnect': 8, 'delete': 2} | 1 | 0.77 | yes |
| remove | * | THE | 10 | {'disconnect': 8, 'delete': 2} | 1 | 0.77 | yes |
| anything | O | * | 10 | {'is_there': 10} | 5 | 0.67 | yes |
| chain | B | NAME | 10 | {'connect': 10} | 0 | 1.0 | yes |
| chain | * | NAME | 10 | {'connect': 10} | 0 | 1.0 | yes |
| place | B | ART | 9 | {'draw': 9} | 0 | 1.0 | yes |
| place | * | ART | 9 | {'draw': 9} | 0 | 1.0 | yes |
| resize | B | THE | 9 | {'resize': 9} | 0 | 1.0 | yes |
| resize | * | THE | 9 | {'resize': 9} | 0 | 1.0 | yes |
| color | B | * | 9 | {'make': 9} | 2 | 0.82 | yes |
| directly connected | NAME | O | 9 | {'connected_q': 9} | 0 | 1.0 | yes |
| directly connected | * | O | 9 | {'connected_q': 9} | 0 | 1.0 | yes |
| connected to | NAME | THE | 9 | {'connected_q': 9} | 0 | 1.0 | yes |
| are there shape | B | O | 9 | {'is_there': 9} | 0 | 0.9 | yes |
| are there shape | * | O | 9 | {'is_there': 9} | 0 | 0.9 | yes |
| are there shape | B | * | 9 | {'is_there': 9} | 0 | 0.9 | yes |
| are there shape | * | * | 9 | {'is_there': 9} | 0 | 0.9 | yes |
| cycle | O | B | 9 | {'cycle_q': 9} | 0 | 1.0 | yes |
| rules | THE | O | 9 | {'which': 9} | 1 | 0.64 | yes |
| anything | * | O | 9 | {'is_there': 9} | 4 | 0.64 | yes |
| arrange | B | THE | 8 | {'arrange': 8} | 0 | 1.0 | yes |
| arrange | * | THE | 8 | {'arrange': 8} | 0 | 1.0 | yes |
| from now on | * | O | 8 | {'from_now_on': 8} | 0 | 1.0 | yes |
| from now on | * | * | 8 | {'from_now_on': 8} | 0 | 1.0 | yes |
| redo | B | THE | 8 | {'redo': 8} | 0 | 1.0 | yes |
| redo | * | THE | 8 | {'redo': 8} | 1 | 0.89 | yes |
| set | B | O | 8 | {'make': 8} | 1 | 0.89 | yes |
| turn | B | * | 8 | {'make': 8} | 0 | 1.0 | yes |
| turn | * | * | 8 | {'make': 8} | 0 | 1.0 | yes |
| farthest | O | O | 8 | {'nearest_q': 8} | 0 | 1.0 | yes |
| what color | B | * | 8 | {'what_color': 8} | 0 | 1.0 | yes |
| what color | * | * | 8 | {'what_color': 8} | 0 | 1.0 | yes |
| align | B | PRON | 8 | {'align': 8} | 0 | 1.0 | yes |
| align | * | PRON | 8 | {'align': 8} | 0 | 1.0 | yes |
| neighbors | NAME | B | 8 | {'neigh_q': 8} | 0 | 1.0 | yes |
| neighbors | * | B | 8 | {'neigh_q': 8} | 0 | 1.0 | yes |
| neighbors | NAME | * | 8 | {'neigh_q': 8} | 0 | 1.0 | yes |
| below | * | PRON | 8 | {'move': 8} | 0 | 0.8 | yes |
| anything | O | O | 8 | {'is_there': 8} | 4 | 0.67 | yes |
| swap | B | THE | 8 | {'swap': 8} | 0 | 1.0 | yes |
| swap | * | THE | 8 | {'swap': 8} | 1 | 0.89 | yes |
| from now on | B | O | 7 | {'from_now_on': 7} | 0 | 1.0 | yes |
| from now on | B | * | 7 | {'from_now_on': 7} | 0 | 1.0 | yes |
| cycle | ART | O | 7 | {'cycle_q': 7} | 0 | 1.0 | yes |
| delete | B | NAME | 7 | {'delete': 7} | 1 | 0.88 | yes |
| delete | * | NAME | 7 | {'delete': 7} | 1 | 0.88 | yes |
| are | NAME | O | 7 | {'is': 7} | 2 | 0.78 | yes |
| are | NAME | * | 7 | {'is': 7} | 3 | 0.7 | yes |
| what color | B | O | 7 | {'what_color': 7} | 0 | 1.0 | yes |
| what color | * | O | 7 | {'what_color': 7} | 0 | 1.0 | yes |
| grid | ART | B | 7 | {'arrange': 7} | 0 | 1.0 | yes |
| grid | * | B | 7 | {'arrange': 7} | 0 | 0.78 | yes |
| grid | ART | * | 7 | {'arrange': 7} | 2 | 0.78 | yes |
| join | B | * | 7 | {'connect': 7} | 0 | 1.0 | yes |
| join | * | * | 7 | {'connect': 7} | 0 | 1.0 | yes |
| enlarge | B | PRON | 7 | {'resize': 7} | 0 | 1.0 | yes |
| enlarge | * | PRON | 7 | {'resize': 7} | 0 | 1.0 | yes |
| forget | B | O | 7 | {'forget': 7} | 0 | 1.0 | yes |
| forget | * | O | 7 | {'forget': 7} | 1 | 0.88 | yes |
| distributed | * | * | 7 | {'distribute': 7} | 0 | 1.0 | yes |
| above | * | PRON | 7 | {'move': 6, 'arrange': 1} | 0 | 0.88 | yes |
| colour | B | NAME | 7 | {'make': 7} | 0 | 1.0 | yes |
| colour | * | NAME | 7 | {'make': 7} | 0 | 1.0 | yes |
| chained | O | * | 7 | {'connect': 7} | 0 | 1.0 | yes |
| chained | * | * | 7 | {'connect': 7} | 0 | 1.0 | yes |
| list | B | THE | 7 | {'which': 7} | 0 | 1.0 | yes |
| list | * | THE | 7 | {'which': 7} | 0 | 1.0 | yes |
| to | PRON | THE | 7 | {'bring': 6, 'send': 1} | 0 | 0.64 | yes |
| arrange | B | PRON | 6 | {'arrange': 6} | 0 | 1.0 | yes |
| arrange | * | PRON | 6 | {'arrange': 6} | 0 | 1.0 | yes |
| where | B | O | 6 | {'where_is': 6} | 0 | 1.0 | yes |
| where | B | * | 6 | {'where_is': 6} | 0 | 1.0 | yes |
| leftmost | O | * | 6 | {'extreme_q': 6} | 0 | 1.0 | yes |
| right_of | NAME | THE | 6 | {'move': 6} | 0 | 0.67 | yes |
| connect | B | THE | 6 | {'connect': 6} | 0 | 1.0 | yes |
| connect | * | THE | 6 | {'connect': 6} | 0 | 1.0 | yes |
| topmost | O | B | 6 | {'extreme_q': 6} | 0 | 1.0 | yes |
| topmost | O | * | 6 | {'extreme_q': 6} | 0 | 1.0 | yes |
| arrange | B | O | 6 | {'arrange': 6} | 0 | 1.0 | yes |
| arrange | * | O | 6 | {'arrange': 6} | 0 | 1.0 | yes |
| chain | B | O | 6 | {'connect': 6} | 0 | 1.0 | yes |
| link | B | THE | 6 | {'connect': 6} | 0 | 1.0 | yes |
| link | * | THE | 6 | {'connect': 6} | 0 | 1.0 | yes |
| reachable from | * | THE | 6 | {'path_q': 6} | 0 | 1.0 | yes |
| below | * | B | 6 | {'move': 6} | 0 | 0.86 | yes |
| farthest | * | B | 6 | {'nearest_q': 6} | 0 | 1.0 | yes |
| distribute | B | NAME | 5 | {'distribute': 5} | 0 | 1.0 | yes |
| distribute | * | NAME | 5 | {'distribute': 5} | 0 | 1.0 | yes |
| column | B | * | 5 | {'arrange': 4, 'move': 1} | 0 | 0.83 | yes |
| list | B | O | 5 | {'which': 5} | 0 | 1.0 | yes |
| link | B | O | 5 | {'connect': 5} | 0 | 1.0 | yes |
| bottom right | * | B | 5 | {'move': 5} | 0 | 0.71 | yes |
| bottom right | * | * | 5 | {'move': 5} | 0 | 0.71 | yes |
| degree | * | B | 5 | {'degree_q': 5} | 0 | 1.0 | yes |
| next_to | * | PRON | 5 | {'move': 5} | 0 | 0.83 | yes |
| bottommost | O | B | 5 | {'extreme_q': 5} | 0 | 1.0 | yes |
| bottommost | O | * | 5 | {'extreme_q': 5} | 0 | 1.0 | yes |
| color | B | THE | 5 | {'make': 5} | 0 | 1.0 | yes |
| color | * | THE | 5 | {'make': 5} | 0 | 1.0 | yes |
| enlarge | B | NAME | 5 | {'resize': 5} | 0 | 1.0 | yes |
| enlarge | * | NAME | 5 | {'resize': 5} | 0 | 1.0 | yes |
| count | B | O | 5 | {'how_many': 5} | 0 | 1.0 | yes |
| count | * | O | 5 | {'how_many': 5} | 1 | 0.83 | yes |
| place | B | THE | 5 | {'move': 5} | 0 | 1.0 | yes |
| place | * | THE | 5 | {'move': 5} | 1 | 0.83 | yes |
| square | ART | O | 5 | {'draw': 5} | 2 | 0.71 | yes |
| above | NAME | PRON | 5 | {'move': 5} | 0 | 1.0 | yes |
| below | NAME | PRON | 5 | {'move': 5} | 0 | 0.71 | yes |
| make | B | ART | 5 | {'draw': 5} | 0 | 1.0 | yes |
| make | * | ART | 5 | {'draw': 5} | 0 | 0.83 | yes |
| smallest | O | B | 5 | {'extreme_q': 5} | 0 | 1.0 | yes |
| smallest | O | * | 5 | {'extreme_q': 5} | 0 | 1.0 | yes |
| distributed | * | B | 5 | {'distribute': 5} | 0 | 1.0 | yes |
| leftmost | O | B | 5 | {'extreme_q': 5} | 0 | 1.0 | yes |
| reachable from | NAME | THE | 5 | {'path_q': 5} | 0 | 1.0 | yes |
| forget | B | PRON | 5 | {'forget': 5} | 0 | 1.0 | yes |
| forget | * | PRON | 5 | {'forget': 5} | 1 | 0.83 | yes |
| below | NAME | B | 5 | {'move': 5} | 0 | 1.0 | yes |
| least connected | O | B | 5 | {'extreme_q': 5} | 0 | 1.0 | yes |
| least connected | O | * | 5 | {'extreme_q': 5} | 0 | 1.0 | yes |
| hook | * | * | 4 | {'connect': 4} | 0 | 1.0 | yes |
| do we have shape | B | O | 4 | {'is_there': 4} | 0 | 1.0 | yes |
| do we have shape | * | O | 4 | {'is_there': 4} | 0 | 1.0 | yes |
| do we have shape | B | * | 4 | {'is_there': 4} | 0 | 1.0 | yes |
| do we have shape | * | * | 4 | {'is_there': 4} | 0 | 1.0 | yes |
| smallest | THE | O | 4 | {'extreme_q': 4} | 0 | 0.67 | yes |
| smallest | * | O | 4 | {'extreme_q': 4} | 0 | 0.67 | yes |
| send | B | THE | 4 | {'send': 3, 'bring': 1} | 0 | 0.67 | yes |
| send | * | THE | 4 | {'send': 3, 'bring': 1} | 0 | 0.67 | yes |
| send | B | * | 4 | {'send': 3, 'bring': 1} | 0 | 0.67 | yes |
| delete | B | O | 4 | {'delete': 4} | 2 | 0.67 | yes |
| how many circles | B | O | 4 | {'how_many': 4} | 0 | 1.0 | yes |
| how many circles | * | O | 4 | {'how_many': 4} | 0 | 1.0 | yes |
| how many circles | B | * | 4 | {'how_many': 4} | 0 | 1.0 | yes |
| how many circles | * | * | 4 | {'how_many': 4} | 0 | 1.0 | yes |
| can i get from | B | NAME | 4 | {'path_q': 4} | 0 | 1.0 | yes |
| can i get from | * | NAME | 4 | {'path_q': 4} | 0 | 1.0 | yes |
| can i get from | B | * | 4 | {'path_q': 4} | 0 | 1.0 | yes |
| can i get from | * | * | 4 | {'path_q': 4} | 0 | 1.0 | yes |
| least connected | THE | O | 4 | {'extreme_q': 4} | 0 | 1.0 | yes |
| least connected | * | O | 4 | {'extreme_q': 4} | 0 | 1.0 | yes |
| distribute | B | THE | 4 | {'distribute': 4} | 0 | 1.0 | yes |
| distribute | * | THE | 4 | {'distribute': 4} | 0 | 1.0 | yes |
| degree of | THE | NAME | 4 | {'degree_q': 4} | 0 | 1.0 | yes |
| degree of | * | NAME | 4 | {'degree_q': 4} | 0 | 1.0 | yes |
| degree of | THE | * | 4 | {'degree_q': 4} | 0 | 1.0 | yes |
| degree of | * | * | 4 | {'degree_q': 4} | 0 | 1.0 | yes |
| bottommost | THE | O | 4 | {'extreme_q': 4} | 0 | 1.0 | yes |
| bottommost | * | O | 4 | {'extreme_q': 4} | 0 | 1.0 | yes |
| get rid of | B | * | 4 | {'delete': 3, 'disconnect': 1} | 0 | 0.8 | yes |
| get rid of | * | * | 4 | {'delete': 3, 'disconnect': 1} | 0 | 0.8 | yes |
| turn | B | THE | 4 | {'make': 4} | 0 | 1.0 | yes |
| turn | * | THE | 4 | {'make': 4} | 0 | 1.0 | yes |
| call | B | * | 4 | {'rename': 4} | 0 | 1.0 | yes |
| call | * | * | 4 | {'rename': 4} | 2 | 0.67 | yes |
| bottom right | NAME | B | 4 | {'move': 4} | 0 | 0.8 | yes |
| bottom right | NAME | * | 4 | {'move': 4} | 0 | 0.8 | yes |
| join | B | NAME | 4 | {'connect': 4} | 0 | 1.0 | yes |
| join | * | NAME | 4 | {'connect': 4} | 0 | 1.0 | yes |
| color | * | B | 4 | {'what_color': 4} | 0 | 1.0 | yes |
| degree | NAME | B | 4 | {'degree_q': 4} | 0 | 1.0 | yes |
| degree | NAME | * | 4 | {'degree_q': 4} | 0 | 1.0 | yes |
| align | B | THE | 4 | {'align': 4} | 0 | 1.0 | yes |
| align | * | THE | 4 | {'align': 4} | 0 | 1.0 | yes |
| should be | NAME | ART | 4 | {'make': 4} | 0 | 1.0 | yes |
| should be | * | ART | 4 | {'make': 4} | 0 | 1.0 | yes |
| star | ART | O | 4 | {'draw': 4} | 0 | 0.8 | yes |
| huge | B | O | 4 | {'make': 4} | 0 | 1.0 | yes |
| huge | B | * | 4 | {'make': 4} | 0 | 1.0 | yes |
| chained | O | B | 4 | {'connect': 4} | 0 | 1.0 | yes |
| chained | * | B | 4 | {'connect': 4} | 0 | 1.0 | yes |
| chain | * | B | 4 | {'connect': 4} | 0 | 1.0 | yes |
| what shape | * | * | 4 | {'what_shape': 4} | 2 | 0.67 | yes |
| distributed | B | * | 4 | {'distribute': 4} | 0 | 1.0 | yes |
| reached from | O | THE | 4 | {'path_q': 3, 'reach_q': 1} | 0 | 0.8 | yes |
| reached from | * | THE | 4 | {'path_q': 3, 'reach_q': 1} | 0 | 0.8 | yes |
| redo | * | B | 4 | {'redo': 4} | 0 | 1.0 | yes |
| farthest | THE | B | 4 | {'nearest_q': 4} | 0 | 1.0 | yes |
| next | * | B | 4 | {'connect': 4} | 0 | 1.0 | yes |
| rightmost | B | B | 4 | {'extreme_q': 4} | 0 | 1.0 | yes |
| rightmost | B | * | 4 | {'extreme_q': 4} | 0 | 1.0 | yes |
| hook | * | PRON | 3 | {'connect': 3} | 0 | 1.0 | yes |
| slide | B | * | 3 | {'move': 3} | 0 | 1.0 | yes |
| connect to | NAME | NAME | 3 | {'connected_q': 3} | 0 | 1.0 | yes |
| connect to | * | NAME | 3 | {'connected_q': 3} | 0 | 1.0 | yes |
| connect to | NAME | * | 3 | {'connected_q': 3} | 0 | 1.0 | yes |
| farthest from | O | NAME | 3 | {'nearest_q': 3} | 0 | 1.0 | yes |
| farthest from | O | * | 3 | {'nearest_q': 3} | 0 | 1.0 | yes |
| which shapes can i reach | B | O | 3 | {'reach_q': 3} | 0 | 1.0 | yes |
| which shapes can i reach | * | O | 3 | {'reach_q': 3} | 0 | 1.0 | yes |
| which shapes can i reach | B | * | 3 | {'reach_q': 3} | 0 | 1.0 | yes |
| which shapes can i reach | * | * | 3 | {'reach_q': 3} | 0 | 1.0 | yes |
| what color is | B | * | 3 | {'what_color': 3} | 0 | 1.0 | yes |
| what color is | * | * | 3 | {'what_color': 3} | 0 | 1.0 | yes |
| sit next_to | NAME | * | 3 | {'is_q': 3} | 0 | 1.0 | yes |
| sit next_to | * | * | 3 | {'is_q': 3} | 0 | 1.0 | yes |
| what can i reach | * | * | 3 | {'reach_q': 3} | 0 | 1.0 | yes |
| link | O | NAME | 3 | {'connect': 3} | 0 | 1.0 | yes |
| how many rectangles | B | O | 3 | {'how_many': 3} | 0 | 1.0 | yes |
| how many rectangles | * | O | 3 | {'how_many': 3} | 0 | 1.0 | yes |
| how many rectangles | B | * | 3 | {'how_many': 3} | 0 | 1.0 | yes |
| how many rectangles | * | * | 3 | {'how_many': 3} | 0 | 1.0 | yes |
| which shapes are next_to | B | NAME | 3 | {'neigh_q': 3} | 0 | 1.0 | yes |
| which shapes are next_to | * | NAME | 3 | {'neigh_q': 3} | 0 | 1.0 | yes |
| which shapes are next_to | B | * | 3 | {'neigh_q': 3} | 0 | 1.0 | yes |
| which shapes are next_to | * | * | 3 | {'neigh_q': 3} | 0 | 1.0 | yes |
| hook | B | * | 3 | {'connect': 3} | 0 | 1.0 | yes |
| shrink | B | NAME | 3 | {'resize': 3} | 0 | 1.0 | yes |
| shrink | * | NAME | 3 | {'resize': 3} | 0 | 1.0 | yes |
| left_of | O | * | 3 | {'move': 3} | 0 | 0.75 | yes |
| another | B | O | 3 | {'draw': 3} | 0 | 1.0 | yes |
| another | * | O | 3 | {'draw': 3} | 0 | 1.0 | yes |
| another | B | * | 3 | {'draw': 3} | 0 | 1.0 | yes |
| another | * | * | 3 | {'draw': 3} | 0 | 1.0 | yes |
| sends to | NAME | NAME | 3 | {'connect': 3} | 2 | 0.6 | yes |
| sends to | * | NAME | 3 | {'connect': 3} | 2 | 0.6 | yes |
| sends to | NAME | * | 3 | {'connect': 3} | 2 | 0.6 | yes |
| sends to | * | * | 3 | {'connect': 3} | 2 | 0.6 | yes |
| shrunk | O | B | 3 | {'resize': 3} | 0 | 1.0 | yes |
| shrunk | * | B | 3 | {'resize': 3} | 0 | 1.0 | yes |
| shrunk | O | * | 3 | {'resize': 3} | 0 | 1.0 | yes |
| shrunk | * | * | 3 | {'resize': 3} | 0 | 1.0 | yes |
| blue circle | ART | * | 3 | {'draw': 3} | 0 | 0.6 | yes |
| next_to | O | PRON | 3 | {'move': 3} | 0 | 0.75 | yes |
| what size | B | O | 3 | {'how_big': 3} | 0 | 1.0 | yes |
| what size | * | O | 3 | {'how_big': 3} | 0 | 1.0 | yes |
| what size | B | * | 3 | {'how_big': 3} | 0 | 1.0 | yes |
| what size | * | * | 3 | {'how_big': 3} | 0 | 1.0 | yes |
| reach | * | NAME | 3 | {'path_q': 3} | 0 | 1.0 | yes |
| color | O | * | 3 | {'what_color': 3} | 2 | 0.6 | yes |
| goes in | NAME | THE | 3 | {'move': 3} | 0 | 1.0 | yes |
| goes in | * | THE | 3 | {'move': 3} | 0 | 1.0 | yes |
| goes in | NAME | * | 3 | {'move': 3} | 0 | 1.0 | yes |
| goes in | * | * | 3 | {'move': 3} | 0 | 1.0 | yes |
| shape | THE | O | 3 | {'what_shape': 3} | 1 | 0.75 | yes |
| left_of | NAME | THE | 3 | {'move': 3} | 0 | 0.75 | yes |
| close to | * | THE | 3 | {'is_q': 3} | 0 | 1.0 | yes |
| close to | * | * | 3 | {'is_q': 3} | 1 | 0.75 | yes |
| shrink | B | PRON | 3 | {'resize': 3} | 0 | 1.0 | yes |
| shrink | * | PRON | 3 | {'resize': 3} | 0 | 1.0 | yes |
| distributed | O | * | 3 | {'distribute': 3} | 0 | 1.0 | yes |
| top left | NAME | B | 3 | {'move': 3} | 0 | 1.0 | yes |
| top left | * | B | 3 | {'move': 3} | 0 | 1.0 | yes |
| top left | NAME | * | 3 | {'move': 3} | 0 | 1.0 | yes |
| top left | * | * | 3 | {'move': 3} | 0 | 1.0 | yes |
| join | B | PRON | 3 | {'connect': 3} | 0 | 1.0 | yes |
| join | * | PRON | 3 | {'connect': 3} | 0 | 1.0 | yes |
| call | B | THE | 3 | {'rename': 3} | 0 | 1.0 | yes |
| call | * | THE | 3 | {'rename': 3} | 0 | 1.0 | yes |
| top | O | B | 3 | {'move': 3} | 0 | 0.75 | yes |
| chain | O | B | 3 | {'connect': 3} | 0 | 1.0 | yes |
| chained | O | O | 3 | {'connect': 3} | 0 | 1.0 | yes |
| chained | * | O | 3 | {'connect': 3} | 0 | 1.0 | yes |
| check | B | NAME | 3 | {'is_q': 3} | 0 | 1.0 | yes |
| check | * | NAME | 3 | {'is_q': 3} | 0 | 1.0 | yes |
| rightmost | O | B | 3 | {'extreme_q': 3} | 0 | 1.0 | yes |
| rightmost | O | * | 3 | {'extreme_q': 3} | 0 | 1.0 | yes |
| does | B | ART | 3 | {'is_there': 3} | 1 | 0.6 | yes |
| does | * | ART | 3 | {'is_there': 3} | 1 | 0.6 | yes |
| top | NAME | O | 3 | {'move': 3} | 0 | 0.75 | yes |
| on top | NAME | B | 3 | {'move': 3} | 0 | 1.0 | yes |
| on top | * | B | 3 | {'move': 3} | 0 | 1.0 | yes |
| on top | NAME | * | 3 | {'move': 3} | 0 | 1.0 | yes |
| on top | * | * | 3 | {'move': 3} | 0 | 1.0 | yes |
| reach from | O | NAME | 3 | {'reach_q': 3} | 0 | 1.0 | yes |
| reach from | * | NAME | 3 | {'reach_q': 3} | 0 | 1.0 | yes |
| reach from | O | * | 3 | {'reach_q': 3} | 2 | 0.6 | yes |
| reach from | * | * | 3 | {'reach_q': 3} | 2 | 0.6 | yes |
| rules | O | O | 3 | {'which': 3} | 0 | 0.75 | yes |
| what shape | B | * | 3 | {'what_shape': 3} | 1 | 0.75 | yes |
| distributed | B | B | 3 | {'distribute': 3} | 0 | 1.0 | yes |
| next | O | B | 3 | {'connect': 3} | 0 | 1.0 | yes |
| redo | B | B | 3 | {'redo': 3} | 0 | 1.0 | yes |
| fewest | THE | B | 3 | {'extreme_q': 3} | 0 | 1.0 | yes |
| fewest | * | B | 3 | {'extreme_q': 3} | 0 | 1.0 | yes |
| fewest | THE | * | 3 | {'extreme_q': 3} | 0 | 1.0 | yes |
| fewest | * | * | 3 | {'extreme_q': 3} | 0 | 1.0 | yes |
| chain | O | PRON | 3 | {'connect': 3} | 0 | 1.0 | yes |
| slap | O | ART | 2 | {'draw': 2} | 0 | 1.0 | yes |
| slap | * | ART | 2 | {'draw': 2} | 0 | 1.0 | yes |
| slap | O | * | 2 | {'draw': 2} | 0 | 1.0 | yes |
| slap | * | * | 2 | {'draw': 2} | 0 | 1.0 | yes |
| slide | B | THE | 2 | {'move': 2} | 0 | 1.0 | yes |
| slide | * | THE | 2 | {'move': 2} | 0 | 1.0 | yes |
| mostconnected | THE | O | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| mostconnected | * | O | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| smaller than | O | NAME | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| smaller than | O | * | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| closest to | O | THE | 2 | {'nearest_q': 2} | 0 | 1.0 | yes |
| closest to | * | THE | 2 | {'nearest_q': 2} | 0 | 1.0 | yes |
| have | NAME | ART | 2 | {'connected_q': 2} | 0 | 0.67 | yes |
| do i have shape | B | O | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| do i have shape | * | O | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| do i have shape | B | * | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| do i have shape | * | * | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| list | B | PRON | 2 | {'which': 2} | 0 | 1.0 | yes |
| list | * | PRON | 2 | {'which': 2} | 0 | 1.0 | yes |
| what is above | B | THE | 2 | {'which': 2} | 0 | 1.0 | yes |
| what is above | * | THE | 2 | {'which': 2} | 0 | 1.0 | yes |
| what is above | B | * | 2 | {'which': 2} | 0 | 1.0 | yes |
| what is above | * | * | 2 | {'which': 2} | 0 | 1.0 | yes |
| bring | B | * | 2 | {'bring': 2} | 0 | 0.67 | yes |
| bring | * | * | 2 | {'bring': 2} | 0 | 0.67 | yes |
| what color is | B | NAME | 2 | {'what_color': 2} | 0 | 1.0 | yes |
| what color is | * | NAME | 2 | {'what_color': 2} | 0 | 1.0 | yes |
| can be reached from | O | NAME | 2 | {'reach_q': 2} | 0 | 1.0 | yes |
| can be reached from | O | * | 2 | {'reach_q': 2} | 0 | 1.0 | yes |
| connected | NAME | B | 2 | {'connected_q': 2} | 0 | 1.0 | yes |
| connected | * | B | 2 | {'connected_q': 2} | 0 | 1.0 | yes |
| connected | NAME | * | 2 | {'connected_q': 2} | 0 | 1.0 | yes |
| how many shapes are below | B | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many shapes are below | * | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many squares | * | O | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many squares | * | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many shapes are next_to | B | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many shapes are next_to | * | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| is anything next_to | B | THE | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| is anything next_to | * | THE | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| is anything next_to | B | * | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| is anything next_to | * | * | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| what shape is | B | NAME | 2 | {'what_shape': 2} | 0 | 1.0 | yes |
| what shape is | * | NAME | 2 | {'what_shape': 2} | 0 | 1.0 | yes |
| what shape is | B | * | 2 | {'what_shape': 2} | 1 | 0.67 | yes |
| what shape is | * | * | 2 | {'what_shape': 2} | 1 | 0.67 | yes |
| find | B | * | 2 | {'path_q': 2} | 0 | 1.0 | yes |
| move | B | O | 2 | {'move': 2} | 0 | 1.0 | yes |
| how many stars | B | O | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many stars | * | O | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many stars | B | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many stars | * | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| connected to | * | B | 2 | {'neigh_q': 2} | 0 | 1.0 | yes |
| are there shape loops | B | O | 2 | {'cycle_q': 2} | 0 | 1.0 | yes |
| are there shape loops | * | O | 2 | {'cycle_q': 2} | 0 | 1.0 | yes |
| are there shape loops | B | * | 2 | {'cycle_q': 2} | 0 | 1.0 | yes |
| are there shape loops | * | * | 2 | {'cycle_q': 2} | 0 | 1.0 | yes |
| sit next_to | NAME | NAME | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| sit next_to | * | NAME | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| how many triangles | B | O | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many triangles | * | O | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many triangles | B | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| how many triangles | * | * | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| what can i reach | B | O | 2 | {'reach_q': 2} | 0 | 1.0 | yes |
| what can i reach | * | O | 2 | {'reach_q': 2} | 0 | 1.0 | yes |
| what can i reach | B | * | 2 | {'reach_q': 2} | 0 | 1.0 | yes |
| make each_other | B | THE | 2 | {'make': 2} | 0 | 1.0 | yes |
| make each_other | * | THE | 2 | {'make': 2} | 0 | 1.0 | yes |
| make each_other | B | * | 2 | {'make': 2} | 0 | 1.0 | yes |
| make each_other | * | * | 2 | {'make': 2} | 0 | 1.0 | yes |
| forget | O | THE | 2 | {'forget': 2} | 0 | 1.0 | yes |
| hook | B | PRON | 2 | {'connect': 2} | 0 | 1.0 | yes |
| line up | B | * | 2 | {'arrange': 2} | 0 | 1.0 | yes |
| line up | * | * | 2 | {'arrange': 2} | 1 | 0.67 | yes |
| back | O | B | 2 | {'send': 2} | 0 | 1.0 | yes |
| back | * | B | 2 | {'send': 2} | 0 | 0.67 | yes |
| left_of | O | NAME | 2 | {'move': 2} | 0 | 1.0 | yes |
| reachable | * | * | 2 | {'path_q': 2} | 1 | 0.67 | yes |
| shove | B | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| shove | * | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| tint | B | * | 2 | {'make': 2} | 0 | 1.0 | yes |
| tint | * | * | 2 | {'make': 2} | 0 | 1.0 | yes |
| is at | NAME | THE | 2 | {'move': 2} | 0 | 1.0 | yes |
| is at | * | THE | 2 | {'move': 2} | 0 | 1.0 | yes |
| is at | NAME | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| is at | * | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| get from | O | NAME | 2 | {'path_q': 2} | 0 | 1.0 | yes |
| get from | * | NAME | 2 | {'path_q': 2} | 0 | 1.0 | yes |
| get from | O | * | 2 | {'path_q': 2} | 0 | 1.0 | yes |
| get from | * | * | 2 | {'path_q': 2} | 0 | 1.0 | yes |
| blue circle | ART | O | 2 | {'draw': 2} | 0 | 1.0 | yes |
| blue circle | * | O | 2 | {'draw': 2} | 0 | 1.0 | yes |
| reach | O | NAME | 2 | {'path_q': 2} | 0 | 1.0 | yes |
| horizontally | NAME | O | 2 | {'arrange': 2} | 1 | 0.67 | yes |
| goes next_to | NAME | THE | 2 | {'move': 2} | 0 | 1.0 | yes |
| goes next_to | * | THE | 2 | {'move': 2} | 0 | 1.0 | yes |
| goes next_to | NAME | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| goes next_to | * | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| distributed | * | O | 2 | {'distribute': 2} | 0 | 1.0 | yes |
| anything | O | PRON | 2 | {'is_there': 2} | 1 | 0.67 | yes |
| anything | * | PRON | 2 | {'is_there': 2} | 1 | 0.67 | yes |
| below | O | PRON | 2 | {'move': 2} | 0 | 1.0 | yes |
| star is | O | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| star is | * | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| star is | O | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| star is | * | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| describe | B | PRON | 2 | {'describe': 2} | 0 | 1.0 | yes |
| describe | * | PRON | 2 | {'describe': 2} | 0 | 1.0 | yes |
| column | B | NAME | 2 | {'arrange': 2} | 0 | 1.0 | yes |
| column | * | NAME | 2 | {'arrange': 2} | 0 | 1.0 | yes |
| above | NAME | B | 2 | {'move': 2} | 0 | 1.0 | yes |
| above | * | B | 2 | {'move': 2} | 0 | 0.67 | yes |
| top right | NAME | B | 2 | {'move': 2} | 0 | 1.0 | yes |
| top right | * | B | 2 | {'move': 2} | 0 | 1.0 | yes |
| top right | NAME | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| top right | * | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| bigger than | O | THE | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| bigger than | O | * | 2 | {'is_q': 2} | 1 | 0.67 | yes |
| distribute | B | O | 2 | {'distribute': 2} | 0 | 1.0 | yes |
| distribute | * | O | 2 | {'distribute': 2} | 0 | 1.0 | yes |
| right_side | O | B | 2 | {'move': 2} | 0 | 1.0 | yes |
| right_side | O | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| distributed | O | B | 2 | {'distribute': 2} | 0 | 1.0 | yes |
| sits in | * | THE | 2 | {'move': 2} | 0 | 1.0 | yes |
| sits in | * | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| large | B | O | 2 | {'make': 2} | 0 | 1.0 | yes |
| large | B | * | 2 | {'make': 2} | 0 | 1.0 | yes |
| bottom left | NAME | B | 2 | {'move': 2} | 0 | 1.0 | yes |
| bottom left | * | B | 2 | {'move': 2} | 0 | 1.0 | yes |
| bottom left | NAME | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| bottom left | * | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| turn | B | NAME | 2 | {'make': 2} | 0 | 1.0 | yes |
| turn | * | NAME | 2 | {'make': 2} | 0 | 1.0 | yes |
| brown square | ART | O | 2 | {'draw': 2} | 0 | 1.0 | yes |
| brown square | * | O | 2 | {'draw': 2} | 0 | 1.0 | yes |
| brown square | ART | * | 2 | {'draw': 2} | 0 | 1.0 | yes |
| close to | NAME | THE | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| close to | NAME | * | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| diamond is | O | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| diamond is | * | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| diamond is | O | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| diamond is | * | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| goes below | NAME | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| goes below | * | * | 2 | {'move': 2} | 0 | 1.0 | yes |
| pointing to | O | THE | 2 | {'connect': 2} | 0 | 1.0 | yes |
| pointing to | * | THE | 2 | {'connect': 2} | 0 | 1.0 | yes |
| pointing to | O | * | 2 | {'connect': 2} | 0 | 1.0 | yes |
| pointing to | * | * | 2 | {'connect': 2} | 0 | 1.0 | yes |
| color | THE | * | 2 | {'what_color': 2} | 0 | 0.67 | yes |
| spread | B | * | 2 | {'distribute': 2} | 0 | 1.0 | yes |
| each_other new squares are | B | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other new squares are | * | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other new squares are | B | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other new squares are | * | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| column | B | THE | 2 | {'arrange': 2} | 0 | 1.0 | yes |
| column | * | THE | 2 | {'arrange': 2} | 0 | 1.0 | yes |
| spaced | O | B | 2 | {'distribute': 2} | 0 | 1.0 | yes |
| spaced | * | B | 2 | {'distribute': 2} | 0 | 1.0 | yes |
| position | O | * | 2 | {'where_is': 2} | 0 | 1.0 | yes |
| magenta hexagon | ART | O | 2 | {'draw': 2} | 0 | 1.0 | yes |
| magenta hexagon | * | O | 2 | {'draw': 2} | 0 | 1.0 | yes |
| magenta hexagon | ART | * | 2 | {'draw': 2} | 0 | 1.0 | yes |
| magenta hexagon | * | * | 2 | {'draw': 2} | 0 | 1.0 | yes |
| next_to | NAME | PRON | 2 | {'move': 2} | 0 | 1.0 | yes |
| circles are | B | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| circles are | * | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| circles are | B | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| circles are | * | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| shape color but | NAME | O | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| shape color but | * | O | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| shape color but | NAME | * | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| shape color but | * | * | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| farthest | O | B | 2 | {'nearest_q': 2} | 0 | 1.0 | yes |
| exists | B | * | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| exists | * | * | 2 | {'is_there': 2} | 0 | 1.0 | yes |
| align | B | O | 2 | {'align': 2} | 0 | 1.0 | yes |
| align | * | O | 2 | {'align': 2} | 0 | 1.0 | yes |
| what shape | B | O | 2 | {'what_shape': 2} | 1 | 0.67 | yes |
| loop | ART | B | 2 | {'cycle_q': 2} | 0 | 1.0 | yes |
| loop | * | B | 2 | {'cycle_q': 2} | 0 | 0.67 | yes |
| connect to | PRON | THE | 2 | {'connect': 2} | 0 | 1.0 | yes |
| connect to | * | THE | 2 | {'connect': 2} | 0 | 1.0 | yes |
| connect to | PRON | * | 2 | {'connect': 2} | 0 | 1.0 | yes |
| rename | B | PRON | 2 | {'rename': 2} | 0 | 1.0 | yes |
| rename | * | PRON | 2 | {'rename': 2} | 0 | 1.0 | yes |
| how many | O | O | 2 | {'how_many': 2} | 1 | 0.67 | yes |
| how many | O | * | 2 | {'how_many': 2} | 1 | 0.67 | yes |
| next_to | PRON | * | 2 | {'is_q': 2} | 0 | 1.0 | yes |
| each_other squares are | B | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other squares are | * | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other squares are | B | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other squares are | * | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other stars are | B | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other stars are | * | O | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other stars are | B | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| each_other stars are | * | * | 2 | {'from_now_on': 2} | 0 | 1.0 | yes |
| count | B | PRON | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| count | * | PRON | 2 | {'how_many': 2} | 0 | 1.0 | yes |
| color | O | B | 2 | {'what_color': 2} | 0 | 1.0 | yes |
| leftmost | B | B | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| leftmost | B | * | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| most | THE | B | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| most | * | B | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| most | THE | * | 2 | {'extreme_q': 2} | 1 | 0.67 | yes |
| cycle | THE | O | 2 | {'cycle_q': 2} | 0 | 1.0 | yes |
| cycle | THE | * | 2 | {'cycle_q': 2} | 0 | 1.0 | yes |
| biggest | O | B | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| biggest | O | * | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| undo | B | O | 2 | {'undo': 2} | 0 | 1.0 | yes |
| undo | * | O | 2 | {'undo': 2} | 0 | 1.0 | yes |
| most connected | O | B | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| most connected | O | * | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| color | B | NAME | 2 | {'make': 2} | 0 | 1.0 | yes |
| color | * | NAME | 2 | {'make': 2} | 0 | 1.0 | yes |
| smallest | B | B | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| smallest | B | * | 2 | {'extreme_q': 2} | 0 | 1.0 | yes |
| closest | THE | B | 2 | {'nearest_q': 2} | 0 | 1.0 | yes |
| closest | * | B | 2 | {'nearest_q': 2} | 0 | 0.67 | yes |
| put | B | * | 312 | {'move': 201, 'draw': 106, 'arrange': 2} | 0 | 0.69 |  |
| put | * | * | 312 | {'move': 201, 'draw': 106, 'arrange': 2} | 1 | 0.69 |  |
| is | * | * | 177 | {'is': 103, 'is_q': 74} | 112 | 0.22 |  |
| to | * | * | 96 | {'bring': 32, 'send': 31, 'move': 21} | 245 | 0.06 |  |
| to | * | THE | 85 | {'bring': 32, 'send': 31, 'move': 13} | 24 | 0.22 |  |
| to | NAME | * | 85 | {'send': 29, 'bring': 24, 'move': 20} | 51 | 0.06 |  |
| is | * | O | 84 | {'is': 83, 'is_q': 1} | 76 | 0.28 |  |
| to | NAME | THE | 75 | {'send': 29, 'bring': 24, 'move': 13} | 3 | 0.24 |  |
| is | B | * | 74 | {'is_q': 74} | 11 | 0.45 |  |
| add | B | * | 51 | {'draw': 38, 'connect': 13} | 0 | 0.8 |  |
| add | * | * | 51 | {'draw': 38, 'connect': 13} | 0 | 0.8 |  |
| in | * | * | 51 | {'move': 50, 'connect': 1} | 44 | 0.34 |  |
| chain | * | * | 47 | {'connect': 46, 'is': 1} | 29 | 0.59 |  |
| is | * | THE | 39 | {'is_q': 37, 'is': 2} | 16 | 0.13 |  |
| reached from | O | * | 34 | {'reach_q': 20, 'path_q': 14} | 0 | 0.71 |  |
| reached from | * | * | 34 | {'reach_q': 20, 'path_q': 14} | 0 | 0.71 |  |
| is | * | NAME | 32 | {'is_q': 32} | 4 | 0.5 |  |
| reached from | O | NAME | 30 | {'reach_q': 19, 'path_q': 11} | 0 | 0.73 |  |
| reached from | * | NAME | 30 | {'reach_q': 19, 'path_q': 11} | 0 | 0.73 |  |
| below | * | * | 26 | {'move': 20, 'is_q': 5, 'which': 1} | 0 | 0.37 |  |
| above | * | * | 25 | {'move': 18, 'is_q': 6, 'arrange': 1} | 3 | 0.24 |  |
| at | * | THE | 25 | {'move': 25} | 12 | 0.6 |  |
| at | * | * | 25 | {'move': 25} | 29 | 0.42 |  |
| rules | * | * | 25 | {'which': 25} | 2 | 0.42 |  |
| label | * | O | 24 | {'label': 17, 'what_says': 7} | 4 | 0.62 |  |
| label | THE | O | 23 | {'label': 16, 'what_says': 7} | 0 | 0.77 |  |
| label | THE | * | 23 | {'label': 16, 'what_says': 7} | 0 | 0.77 |  |
| above | NAME | * | 22 | {'move': 16, 'is_q': 6} | 0 | 0.24 |  |
| draw | * | * | 22 | {'draw': 19, 'connect': 3} | 17 | 0.52 |  |
| below | NAME | * | 19 | {'move': 14, 'is_q': 5} | 0 | 0.37 |  |
| should be | * | * | 19 | {'make': 18, 'from_now_on': 1} | 6 | 0.47 |  |
| is | * | ART | 18 | {'is': 18} | 13 | 0.51 |  |
| next_to | * | * | 18 | {'move': 8, 'neigh_q': 7, 'is_q': 3} | 9 | 0.11 |  |
| place | B | * | 17 | {'draw': 9, 'move': 7, 'arrange': 1} | 0 | 0.68 |  |
| place | * | * | 17 | {'draw': 9, 'move': 7, 'arrange': 1} | 5 | 0.57 |  |
| path | * | * | 17 | {'path_q': 17} | 12 | 0.59 |  |
| path | * | O | 16 | {'path_q': 16} | 12 | 0.57 |  |
| color | * | * | 15 | {'make': 9, 'what_color': 6} | 4 | 0.56 |  |
| should be | * | O | 15 | {'make': 14, 'from_now_on': 1} | 6 | 0.42 |  |
| list | * | * | 14 | {'which': 14} | 11 | 0.54 |  |
| how many connections | B | O | 13 | {'degree_q': 8, 'how_many': 5} | 0 | 0.72 |  |
| how many connections | * | O | 13 | {'degree_q': 8, 'how_many': 5} | 0 | 0.68 |  |
| how many connections | B | * | 13 | {'degree_q': 8, 'how_many': 5} | 0 | 0.72 |  |
| how many connections | * | * | 13 | {'degree_q': 8, 'how_many': 5} | 0 | 0.68 |  |
| remove | B | * | 13 | {'disconnect': 9, 'delete': 4} | 1 | 0.72 |  |
| remove | * | * | 13 | {'disconnect': 9, 'delete': 4} | 1 | 0.68 |  |
| rules | THE | B | 13 | {'which': 13} | 0 | 0.59 |  |
| rules | * | B | 13 | {'which': 13} | 0 | 0.32 |  |
| next_to | O | * | 12 | {'neigh_q': 7, 'move': 4, 'is_q': 1} | 8 | 0.29 |  |
| horizontally | * | * | 12 | {'arrange': 12} | 1 | 0.22 |  |
| above | NAME | THE | 11 | {'move': 7, 'is_q': 4} | 0 | 0.21 |  |
| above | * | THE | 11 | {'move': 7, 'is_q': 4} | 2 | 0.19 |  |
| reachable from | O | * | 11 | {'reach_q': 7, 'path_q': 4} | 0 | 0.73 |  |
| put | * | PRON | 11 | {'move': 11} | 0 | 0.58 |  |
| should be | NAME | * | 11 | {'make': 11} | 1 | 0.48 |  |
| reachable from | O | NAME | 10 | {'reach_q': 7, 'path_q': 3} | 0 | 0.77 |  |
| right_of | * | * | 9 | {'move': 9} | 0 | 0.31 |  |
| between | * | * | 9 | {'move': 5, 'is_q': 4} | 4 | 0.12 |  |
| horizontally | * | B | 9 | {'arrange': 9} | 0 | 0.23 |  |
| connected to | O | * | 8 | {'neigh_q': 3, 'connect': 3, 'connected_q': 2} | 2 | 0.33 |  |
| set | * | O | 8 | {'make': 8} | 6 | 0.47 |  |
| left_of | * | * | 8 | {'move': 8} | 0 | 0.35 |  |
| grid | * | * | 8 | {'arrange': 7, 'make': 1} | 10 | 0.36 |  |
| right_of | NAME | * | 8 | {'move': 8} | 0 | 0.5 |  |
| to | * | O | 8 | {'move': 8} | 99 | 0.05 |  |
| are | * | O | 7 | {'is': 7} | 35 | 0.1 |  |
| are | * | * | 7 | {'is': 7} | 43 | 0.06 |  |
| does | B | * | 7 | {'is_there': 4, 'is_q': 3} | 2 | 0.33 |  |
| does | * | * | 7 | {'is_there': 4, 'is_q': 3} | 3 | 0.3 |  |
| shape | * | O | 7 | {'is_there': 4, 'what_shape': 3} | 44 | 0.03 |  |
| shape | * | * | 7 | {'is_there': 4, 'what_shape': 3} | 45 | 0.02 |  |
| should be | NAME | O | 7 | {'make': 7} | 1 | 0.37 |  |
| which shapes | B | O | 7 | {'which': 7} | 0 | 0.47 |  |
| which shapes | * | O | 7 | {'which': 7} | 0 | 0.47 |  |
| which shapes | B | * | 7 | {'which': 7} | 0 | 0.47 |  |
| which shapes | * | * | 7 | {'which': 7} | 0 | 0.47 |  |
| right_of | * | THE | 7 | {'move': 7} | 0 | 0.44 |  |
| chain | * | O | 7 | {'connect': 7} | 27 | 0.2 |  |
| to | NAME | O | 7 | {'move': 7} | 1 | 0.15 |  |
| chain | O | * | 7 | {'connect': 7} | 24 | 0.23 |  |
| horizontally | O | * | 7 | {'arrange': 7} | 0 | 0.58 |  |
| between | NAME | * | 7 | {'is_q': 4, 'move': 3} | 1 | 0.1 |  |
| to | PRON | * | 7 | {'bring': 6, 'send': 1} | 0 | 0.21 |  |
| check | B | * | 7 | {'is_q': 7} | 7 | 0.41 |  |
| check | * | * | 7 | {'is_q': 7} | 15 | 0.27 |  |
| connect to | * | * | 6 | {'connected_q': 3, 'connect': 3} | 1 | 0.6 |  |
| next_to | * | THE | 6 | {'neigh_q': 3, 'move': 3} | 7 | 0.06 |  |
| below | * | THE | 6 | {'move': 3, 'is_q': 2, 'which': 1} | 0 | 0.26 |  |
| next_to | * | NAME | 6 | {'neigh_q': 4, 'is_q': 2} | 0 | 0.1 |  |
| below | * | NAME | 6 | {'move': 3, 'is_q': 3} | 0 | 0.21 |  |
| below | O | * | 6 | {'move': 5, 'which': 1} | 0 | 0.35 |  |
| goes to | NAME | * | 6 | {'connect': 5, 'move': 1} | 19 | 0.23 |  |
| goes to | * | * | 6 | {'connect': 5, 'move': 1} | 19 | 0.23 |  |
| where | * | O | 6 | {'where_is': 6} | 10 | 0.38 |  |
| where | * | * | 6 | {'where_is': 6} | 13 | 0.32 |  |
| should be | O | O | 6 | {'make': 5, 'from_now_on': 1} | 2 | 0.5 |  |
| should be | O | * | 6 | {'make': 5, 'from_now_on': 1} | 2 | 0.5 |  |
| horizontally | O | B | 6 | {'arrange': 6} | 0 | 0.55 |  |
| linked to | * | * | 5 | {'connected_q': 3, 'neigh_q': 2} | 4 | 0.42 |  |
| is above | NAME | * | 5 | {'is': 3, 'is_q': 2} | 0 | 0.71 |  |
| is above | * | * | 5 | {'is': 3, 'is_q': 2} | 0 | 0.71 |  |
| what is | B | THE | 5 | {'what_shape': 2, 'how_big': 1, 'what_color': 1} | 0 | 0.08 |  |
| what is | * | THE | 5 | {'what_shape': 2, 'how_big': 1, 'what_color': 1} | 0 | 0.08 |  |
| what is | B | * | 5 | {'what_shape': 2, 'how_big': 1, 'what_color': 1} | 0 | 0.06 |  |
| what is | * | * | 5 | {'what_shape': 2, 'how_big': 1, 'what_color': 1} | 0 | 0.06 |  |
| next_to | O | NAME | 5 | {'neigh_q': 4, 'is_q': 1} | 0 | 0.33 |  |
| column | * | * | 5 | {'arrange': 4, 'move': 1} | 1 | 0.5 |  |
| above | * | NAME | 5 | {'move': 3, 'is_q': 2} | 0 | 0.15 |  |
| list | * | O | 5 | {'which': 5} | 11 | 0.29 |  |
| link | * | O | 5 | {'connect': 5} | 5 | 0.28 |  |
| goes to | NAME | NAME | 5 | {'connect': 5} | 18 | 0.22 |  |
| goes to | * | NAME | 5 | {'connect': 5} | 18 | 0.22 |  |
| huge | * | O | 5 | {'make': 5} | 1 | 0.24 |  |
| huge | * | * | 5 | {'make': 5} | 1 | 0.21 |  |
| below | NAME | NAME | 5 | {'is_q': 3, 'move': 2} | 0 | 0.1 |  |
| horizontally | NAME | * | 5 | {'arrange': 5} | 1 | 0.24 |  |
| left_of | NAME | * | 5 | {'move': 5} | 0 | 0.56 |  |
| square | * | O | 5 | {'draw': 5} | 2 | 0.28 |  |
| square | ART | * | 5 | {'draw': 5} | 2 | 0.36 |  |
| square | * | * | 5 | {'draw': 5} | 2 | 0.05 |  |
| connected to | O | NAME | 4 | {'connected_q': 2, 'neigh_q': 1, 'connect': 1} | 0 | 0.67 |  |
| send | * | * | 4 | {'send': 3, 'bring': 1} | 2 | 0.5 |  |
| next_to | O | THE | 4 | {'neigh_q': 3, 'move': 1} | 6 | 0.24 |  |
| delete | * | O | 4 | {'delete': 4} | 3 | 0.57 |  |
| is above | NAME | THE | 4 | {'is': 2, 'is_q': 2} | 0 | 0.67 |  |
| is above | * | THE | 4 | {'is': 2, 'is_q': 2} | 0 | 0.67 |  |
| color | * | O | 4 | {'make': 2, 'what_color': 2} | 4 | 0.33 |  |
| below | NAME | THE | 4 | {'is_q': 2, 'move': 2} | 0 | 0.08 |  |
| above | NAME | NAME | 4 | {'is_q': 2, 'move': 2} | 0 | 0.09 |  |
| left_of | * | NAME | 4 | {'move': 4} | 0 | 0.31 |  |
| show me | B | * | 4 | {'describe': 2, 'how_many': 1, 'which': 1} | 0 | 0.27 |  |
| show me | * | * | 4 | {'describe': 2, 'how_many': 1, 'which': 1} | 0 | 0.27 |  |
| loop | ART | * | 4 | {'cycle_q': 4} | 2 | 0.5 |  |
| loop | * | * | 4 | {'cycle_q': 4} | 6 | 0.31 |  |
| to | O | * | 4 | {'bring': 2, 'send': 1, 'move': 1} | 194 | 0.01 |  |
| what are | B | THE | 4 | {'which': 4} | 0 | 0.57 |  |
| what are | * | THE | 4 | {'which': 4} | 0 | 0.57 |  |
| what are | B | * | 4 | {'which': 4} | 0 | 0.44 |  |
| what are | * | * | 4 | {'which': 4} | 0 | 0.4 |  |
| left_of | * | THE | 4 | {'move': 4} | 0 | 0.4 |  |
| leads to | NAME | NAME | 4 | {'connect': 4} | 13 | 0.24 |  |
| leads to | * | NAME | 4 | {'connect': 4} | 14 | 0.22 |  |
| leads to | NAME | * | 4 | {'connect': 4} | 13 | 0.24 |  |
| leads to | * | * | 4 | {'connect': 4} | 15 | 0.21 |  |
| in | O | * | 4 | {'move': 3, 'connect': 1} | 42 | 0.06 |  |
| connects to | NAME | NAME | 4 | {'connect': 4} | 4 | 0.5 |  |
| connects to | * | NAME | 4 | {'connect': 4} | 4 | 0.5 |  |
| connects to | NAME | * | 4 | {'connect': 4} | 5 | 0.44 |  |
| connects to | * | * | 4 | {'connect': 4} | 5 | 0.44 |  |
| star | * | O | 4 | {'draw': 4} | 1 | 0.24 |  |
| star | ART | * | 4 | {'draw': 4} | 0 | 0.4 |  |
| star | * | * | 4 | {'draw': 4} | 1 | 0.05 |  |
| next_to | NAME | * | 4 | {'move': 4} | 1 | 0.04 |  |
| next | * | * | 4 | {'connect': 4} | 11 | 0.27 |  |
| is | B | PRON | 4 | {'is_q': 4} | 1 | 0.57 |  |
| is | * | PRON | 4 | {'is_q': 4} | 3 | 0.44 |  |
| slide | * | * | 3 | {'move': 3} | 4 | 0.43 |  |
| linked to | NAME | * | 3 | {'connected_q': 2, 'neigh_q': 1} | 0 | 0.75 |  |
| connected | * | * | 3 | {'connected_q': 2, 'connect': 1} | 6 | 0.3 |  |
| show | B | * | 3 | {'describe': 2, 'which': 1} | 1 | 0.21 |  |
| show | * | * | 3 | {'describe': 2, 'which': 1} | 19 | 0.09 |  |
| link | O | * | 3 | {'connect': 3} | 4 | 0.38 |  |
| to | NAME | NAME | 3 | {'connect': 3} | 47 | 0.02 |  |
| to | * | NAME | 3 | {'connect': 3} | 121 | 0.01 |  |
| linked to | * | NAME | 3 | {'connected_q': 2, 'neigh_q': 1} | 0 | 0.6 |  |
| cycle | O | O | 3 | {'cycle_q': 3} | 4 | 0.43 |  |
| goes | NAME | O | 3 | {'move': 3} | 23 | 0.12 |  |
| goes | * | O | 3 | {'move': 3} | 28 | 0.1 |  |
| goes | NAME | * | 3 | {'move': 3} | 23 | 0.12 |  |
| goes | * | * | 3 | {'move': 3} | 28 | 0.1 |  |
| show me | B | O | 3 | {'describe': 2, 'how_many': 1} | 0 | 0.6 |  |
| show me | * | O | 3 | {'describe': 2, 'how_many': 1} | 0 | 0.6 |  |
| does | B | NAME | 3 | {'is_q': 3} | 0 | 0.43 |  |
| does | * | NAME | 3 | {'is_q': 3} | 0 | 0.43 |  |
| shape | B | O | 3 | {'is_there': 3} | 1 | 0.3 |  |
| shape | B | * | 3 | {'is_there': 3} | 1 | 0.3 |  |
| circle | * | * | 3 | {'arrange': 2, 'make': 1} | 5 | 0.01 |  |
| blue circle | * | * | 3 | {'draw': 3} | 0 | 0.25 |  |
| to | O | THE | 3 | {'bring': 2, 'send': 1} | 21 | 0.05 |  |
| reach | * | * | 3 | {'path_q': 3} | 5 | 0.38 |  |
| horizontally | * | O | 3 | {'arrange': 3} | 1 | 0.19 |  |
| shape | THE | * | 3 | {'what_shape': 3} | 1 | 0.5 |  |
| above | O | * | 3 | {'move': 2, 'arrange': 1} | 3 | 0.23 |  |
| in | O | THE | 3 | {'move': 3} | 12 | 0.17 |  |
| remove | B | NAME | 3 | {'delete': 2, 'disconnect': 1} | 0 | 0.75 |  |
| remove | * | NAME | 3 | {'delete': 2, 'disconnect': 1} | 0 | 0.75 |  |
| between | * | PRON | 3 | {'move': 3} | 1 | 0.5 |  |
| top | O | * | 3 | {'move': 3} | 0 | 0.5 |  |
| between | NAME | NAME | 3 | {'is_q': 2, 'move': 1} | 0 | 0.06 |  |
| between | * | NAME | 3 | {'is_q': 2, 'move': 1} | 1 | 0.05 |  |
| large | * | * | 3 | {'make': 2, 'is_q': 1} | 4 | 0.06 |  |
| top | * | O | 3 | {'move': 3} | 1 | 0.43 |  |
| get rid of | B | THE | 3 | {'delete': 2, 'disconnect': 1} | 0 | 0.75 |  |
| get rid of | * | THE | 3 | {'delete': 2, 'disconnect': 1} | 0 | 0.75 |  |
| rules | O | * | 3 | {'which': 3} | 0 | 0.13 |  |
| next | O | * | 3 | {'connect': 3} | 9 | 0.25 |  |
| horizontally | NAME | B | 3 | {'arrange': 3} | 0 | 0.17 |  |
| from | * | * | 3 | {'path_q': 2, 'reach_q': 1} | 17 | 0.04 |  |
| have | * | ART | 2 | {'connected_q': 2} | 6 | 0.17 |  |
| have | NAME | * | 2 | {'connected_q': 2} | 0 | 0.5 |  |
| have | * | * | 2 | {'connected_q': 2} | 13 | 0.08 |  |
| can be reached from | * | NAME | 2 | {'reach_q': 2} | 0 | 0.5 |  |
| can be reached from | * | * | 2 | {'reach_q': 2} | 0 | 0.5 |  |
| color | B | O | 2 | {'make': 2} | 2 | 0.5 |  |
| find | * | * | 2 | {'path_q': 2} | 9 | 0.18 |  |
| move | * | O | 2 | {'move': 2} | 4 | 0.29 |  |
| give | B | * | 2 | {'make': 2} | 2 | 0.09 |  |
| give | * | * | 2 | {'make': 2} | 3 | 0.08 |  |
| forget | O | * | 2 | {'forget': 2} | 2 | 0.5 |  |
| is | NAME | THE | 2 | {'is': 2} | 2 | 0.5 |  |
| go to | O | THE | 2 | {'move': 1, 'connect': 1} | 1 | 0.5 |  |
| go to | * | THE | 2 | {'move': 1, 'connect': 1} | 3 | 0.33 |  |
| go to | O | * | 2 | {'move': 1, 'connect': 1} | 1 | 0.5 |  |
| go to | * | * | 2 | {'move': 1, 'connect': 1} | 5 | 0.25 |  |
| back | O | * | 2 | {'send': 2} | 4 | 0.29 |  |
| back | * | * | 2 | {'send': 2} | 6 | 0.1 |  |
| linked to | O | NAME | 2 | {'neigh_q': 1, 'connected_q': 1} | 0 | 0.08 |  |
| linked to | O | * | 2 | {'neigh_q': 1, 'connected_q': 1} | 4 | 0.06 |  |
| push | B | * | 2 | {'move': 2} | 0 | 0.5 |  |
| push | * | * | 2 | {'move': 2} | 0 | 0.5 |  |
| loop | ART | O | 2 | {'cycle_q': 2} | 2 | 0.33 |  |
| loop | * | O | 2 | {'cycle_q': 2} | 6 | 0.2 |  |
| label | ART | * | 2 | {'label': 1, 'what_says': 1} | 1 | 0.29 |  |
| linked | O | O | 2 | {'connect': 2} | 5 | 0.29 |  |
| linked | * | O | 2 | {'connect': 2} | 5 | 0.29 |  |
| linked | O | * | 2 | {'connect': 2} | 5 | 0.29 |  |
| front | * | O | 2 | {'bring': 2} | 3 | 0.29 |  |
| front | * | * | 2 | {'bring': 2} | 3 | 0.25 |  |
| links to | NAME | NAME | 2 | {'connect': 2} | 3 | 0.4 |  |
| links to | * | NAME | 2 | {'connect': 2} | 3 | 0.4 |  |
| links to | NAME | * | 2 | {'connect': 2} | 3 | 0.4 |  |
| links to | * | * | 2 | {'connect': 2} | 3 | 0.4 |  |
| below | O | THE | 2 | {'which': 1, 'move': 1} | 0 | 0.22 |  |
| circle | ART | B | 2 | {'arrange': 2} | 0 | 0.17 |  |
| circle | * | B | 2 | {'arrange': 2} | 0 | 0.02 |  |
| circle | ART | * | 2 | {'arrange': 2} | 1 | 0.1 |  |
| reach | O | * | 2 | {'path_q': 2} | 5 | 0.29 |  |
| name | B | * | 2 | {'rename': 2} | 1 | 0.5 |  |
| name | * | * | 2 | {'rename': 2} | 2 | 0.4 |  |
| place | B | NAME | 2 | {'arrange': 1, 'move': 1} | 0 | 0.67 |  |
| place | * | NAME | 2 | {'arrange': 1, 'move': 1} | 0 | 0.67 |  |
| above | O | PRON | 2 | {'arrange': 1, 'move': 1} | 0 | 0.5 |  |
| between | O | PRON | 2 | {'move': 2} | 0 | 0.5 |  |
| between | O | * | 2 | {'move': 2} | 2 | 0.15 |  |
| next_to | NAME | THE | 2 | {'move': 2} | 1 | 0.03 |  |
| path | O | * | 2 | {'path_q': 2} | 10 | 0.17 |  |
| each_other | * | * | 2 | {'from_now_on': 1, 'connect': 1} | 7 | 0.02 |  |
| show | B | THE | 2 | {'describe': 2} | 0 | 0.5 |  |
| show | * | THE | 2 | {'describe': 2} | 1 | 0.4 |  |
| red circle | ART | * | 2 | {'draw': 2} | 0 | 0.33 |  |
| red circle | * | * | 2 | {'draw': 2} | 0 | 0.13 |  |
| large | * | O | 2 | {'make': 2} | 4 | 0.06 |  |
| between | NAME | O | 2 | {'move': 1, 'is_q': 1} | 0 | 0.67 |  |
| between | * | O | 2 | {'move': 1, 'is_q': 1} | 2 | 0.4 |  |
| brown square | * | * | 2 | {'draw': 2} | 0 | 0.18 |  |
| left_of | NAME | NAME | 2 | {'move': 2} | 0 | 0.4 |  |
| small | PRON | * | 2 | {'make': 1, 'how_big': 1} | 0 | 0.5 |  |
| small | * | * | 2 | {'make': 1, 'how_big': 1} | 30 | 0.01 |  |
| spread | * | * | 2 | {'distribute': 2} | 3 | 0.4 |  |
| connected to | O | O | 2 | {'connect': 2} | 1 | 0.5 |  |
| connected to | * | O | 2 | {'connect': 2} | 1 | 0.5 |  |
| check | B | O | 2 | {'is_q': 2} | 2 | 0.5 |  |
| check | * | O | 2 | {'is_q': 2} | 8 | 0.18 |  |
| spaced | O | * | 2 | {'distribute': 2} | 2 | 0.5 |  |
| spaced | * | * | 2 | {'distribute': 2} | 2 | 0.5 |  |
| position | * | * | 2 | {'where_is': 2} | 2 | 0.5 |  |
| what shape | * | O | 2 | {'what_shape': 2} | 2 | 0.5 |  |
| is | O | * | 2 | {'is': 2} | 68 | 0.01 |  |
| most | * | * | 2 | {'extreme_q': 2} | 2 | 0.5 |  |
| from | * | NAME | 2 | {'reach_q': 1, 'path_q': 1} | 5 | 0.03 |  |
