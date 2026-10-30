# World `real`: built from 235 training messages (1109 requests with a span)

Front end learned from the same messages: 71 value n-grams, 434 trigger rules, 5213 segmenter weights; params {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}.

Rows: 1101. Dropped (cannot be trained): 8 {'no event token and no role (zero target)': 8}.

Kinds: 53; lexicon 187 words (legend value tokens 105, event tokens 44, own-kind tokens seen >= 8 times).

Own-kind tokens: a, and, are, arrow, at, be, called, can, does, from, has, have, i, in, it, labeled, last, line, lines, me, named, now, of, on, one, other, put, reached, shape, that, the, them, then, there, to, what, who, with

Roles left out because their words are not in the normalized span (rows kept):

| what | n |
|---|---|
| event token not found | 152 |
| name | 119 |
| chain | 20 |
| right_side | 11 |
| next_to | 9 |
| rules | 8 |
| head | 7 |
| two_way | 6 |
| left_side | 6 |
| below | 4 |
| 2 | 4 |
| top_left | 4 |
| right_of | 4 |
| shape | 4 |
| ring | 4 |
| bottom_right | 3 |
| not_blue | 3 |
| 4 | 2 |
| $new | 2 |
| horizontally | 2 |
| gold | 2 |
| oldest | 2 |
| t_inlet | 1 |
| t_grandma_grace | 1 |
| n_pi_ata | 1 |
| t_dc_motor | 1 |
| ellipse | 1 |
| biggest | 1 |
| mostconnected | 1 |
| orange | 1 |
| row | 1 |
| bottom_left | 1 |
| not_lime | 1 |
| small | 1 |
| vertically | 1 |
| 5 | 1 |
| right | 1 |
| circle | 1 |
| left_of | 1 |
| square | 1 |

| event | rows |
|---|---|
| connect | 175 |
| set | 172 |
| move | 158 |
| extreme | 85 |
| create | 71 |
| check | 50 |
| count | 27 |
| arrange | 26 |
| list | 25 |
| fact | 24 |
| nearest | 24 |
| path | 23 |
| connected | 17 |
| duplicate | 16 |
| delete | 16 |
| rename | 15 |
| rule | 14 |
| describe | 14 |
| resize | 13 |
| property | 12 |
| toFront | 12 |
| exists | 11 |
| redo | 10 |
| reachable | 9 |
| distribute | 9 |
| toBack | 9 |
| neighbors | 8 |
| undo | 8 |
| label | 7 |
| cycle | 7 |
| forget | 7 |
| swap | 7 |
| align | 7 |
| disconnect | 7 |
| degree | 6 |
