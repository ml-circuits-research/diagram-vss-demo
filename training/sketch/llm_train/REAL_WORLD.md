# World `real`: built from 947 training messages (4305 requests with a span)

Front end learned from the same messages: 119 value n-grams, 961 trigger rules, 9829 segmenter weights; params {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}.

Rows: 4282. Dropped (cannot be trained): 23 {'no event token and no role (zero target)': 23}.

Kinds: 102; lexicon 236 words (legend value tokens 105, event tokens 44, own-kind tokens seen >= 8 times).

Own-kind tokens: a, an, and, any, are, arrow, arrows, as, at, axis, back, be, both, box, by, called, can, check, diagram, directly, do, does, each, evenly, every, exist, for, four, from, front, give, goes, has, have, here, i, if, in, it, just, labeled, last, line, lines, link, map, me, named, new, no, not, now, of, on, once, one, pixels, place, put, reached, remove, rules, shape, shapes, should, show, tell, that, the, them, then, there, thing, this, those, three, to, too, two, uh, we, what, what's, who, whole, with, you

Roles left out because their words are not in the normalized span (rows kept):

| what | n |
|---|---|
| event token not found | 440 |
| name | 420 |
| chain | 65 |
| head | 33 |
| next_to | 26 |
| rules | 24 |
| right_side | 18 |
| ring | 15 |
| left_side | 14 |
| two_way | 9 |
| shape | 9 |
| not_blue | 8 |
| not_red | 7 |
| below | 6 |
| left | 5 |
| right_of | 5 |
| left_of | 5 |
| $new | 4 |
| newest | 4 |
| 2 | 4 |
| circle | 4 |
| horizontally | 4 |
| right | 3 |
| not_orange | 3 |
| not_brown | 3 |
| not_black | 3 |
| 3 | 3 |
| top_right | 3 |
| bigger | 3 |
| top | 2 |
| not_gray | 2 |
| not_teal | 2 |
| bottom | 2 |
| not_lime | 2 |
| not_green | 2 |
| vertically | 2 |
| gold | 2 |
| t_hot_magma | 1 |
| t_place_order | 1 |
| t_old_books | 1 |

| event | rows |
|---|---|
| set | 704 |
| connect | 687 |
| move | 609 |
| extreme | 294 |
| create | 284 |
| check | 188 |
| fact | 108 |
| path | 107 |
| list | 99 |
| count | 95 |
| arrange | 93 |
| nearest | 90 |
| connected | 73 |
| duplicate | 64 |
| rename | 63 |
| exists | 48 |
| property | 47 |
| delete | 46 |
| resize | 46 |
| degree | 42 |
| reachable | 39 |
| describe | 38 |
| rule | 37 |
| label | 36 |
| undo | 35 |
| cycle | 34 |
| swap | 33 |
| align | 33 |
| neighbors | 32 |
| toFront | 31 |
| disconnect | 31 |
| toBack | 31 |
| forget | 30 |
| distribute | 29 |
| redo | 26 |
